"use server";

import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteAllSessionsForUser, destroySession, getSession } from "@/lib/auth/session";
import {
  clearTotpEnrollmentCookie,
  clearTwoFactorPendingCookie,
  getTotpEnrollmentState,
  getTwoFactorPendingUserId,
  setTotpEnrollmentCookie,
} from "@/lib/auth/two-factor-cookies";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpSecretBase32,
  hashRecoveryCode,
  normalizeRecoveryCodeInput,
  otpauthUri,
  verifyTotpToken,
} from "@/lib/auth/totp";

export type TwofaFormState = { error?: string; ok?: boolean; recoveryCodes?: string[] } | null;

export async function verifyTwoFactorLoginAction(
  _prev: TwofaFormState,
  formData: FormData
): Promise<TwofaFormState> {
  const raw = String(formData.get("code") ?? "");
  const code = raw.trim().replace(/\s/g, "");
  const pendingId = await getTwoFactorPendingUserId();
  if (!pendingId) {
    return { error: "Sign-in expired. Start again from the login page." };
  }

  const supabase = createServiceClient();
  const { data: user, error } = await supabase
    .from("auth_user")
    .select("id, totp_secret_encrypted, two_factor_enabled")
    .eq("id", pendingId)
    .maybeSingle();

  if (error || !user?.two_factor_enabled || !user.totp_secret_encrypted) {
    await clearTwoFactorPendingCookie();
    return { error: "Account not found or 2FA misconfigured." };
  }

  let secretPlain: string;
  try {
    secretPlain = decryptTotpSecret(user.totp_secret_encrypted);
  } catch {
    await clearTwoFactorPendingCookie();
    return { error: "Could not verify. Try again." };
  }

  const totpOk = /^\d{6}$/.test(code) && verifyTotpToken(secretPlain, code);

  let recoveryOk = false;
  if (!totpOk && raw.length >= 8) {
    const norm = normalizeRecoveryCodeInput(raw);
    const h = hashRecoveryCode(norm);
    const { data: row } = await supabase
      .from("auth_recovery_code")
      .select("id")
      .eq("user_id", pendingId)
      .eq("code_hash", h)
      .is("used_at", null)
      .maybeSingle();
    if (row?.id) {
      recoveryOk = true;
      await supabase
        .from("auth_recovery_code")
        .update({ used_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }

  if (!totpOk && !recoveryOk) {
    return { error: "Invalid code. Try your authenticator app or a recovery code." };
  }

  await clearTwoFactorPendingCookie();
  try {
    await createSession(pendingId);
  } catch {
    return { error: "Could not create session. Check AUTH_SECRET in .env.local." };
  }

  if (process.env.USE_LEGACY_CLERK !== "false") {
    redirect("/credentials/login?custom_session=1");
  }
  redirect("/dashboard");
}

export async function startTotpEnrollmentAction(): Promise<
  { ok: true; qrDataUrl: string } | { ok: false; error: string }
> {
  const s = await getSession();
  if (!s) return { ok: false, error: "Sign in again." };

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("auth_user")
    .select("id, email, two_factor_enabled")
    .eq("id", s.userId)
    .maybeSingle();

  if (!user) return { ok: false, error: "Account not found." };
  if (user.two_factor_enabled) return { ok: false, error: "Two-factor authentication is already enabled." };

  const secret = generateTotpSecretBase32();
  await setTotpEnrollmentCookie(s.userId, secret);

  const uri = otpauthUri(secret, user.email);
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 2, width: 220 });

  return { ok: true, qrDataUrl };
}

export async function confirmTotpEnrollmentAction(
  _prev: TwofaFormState,
  formData: FormData
): Promise<TwofaFormState> {
  const code = String(formData.get("code") ?? "").trim().replace(/\s/g, "");
  const enroll = await getTotpEnrollmentState();
  if (!enroll) {
    return { error: "Setup expired. Click “Set up authenticator” again." };
  }
  if (!/^\d{6}$/.test(code) || !verifyTotpToken(enroll.secret, code)) {
    return { error: "Invalid code. Check the time on your phone." };
  }

  const supabase = createServiceClient();
  const enc = encryptTotpSecret(enroll.secret);
  const { error: upErr } = await supabase
    .from("auth_user")
    .update({
      totp_secret_encrypted: enc,
      two_factor_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enroll.userId);

  if (upErr) {
    return { error: upErr.message ?? "Could not save 2FA." };
  }

  await supabase.from("auth_recovery_code").delete().eq("user_id", enroll.userId);

  const codes = generateRecoveryCodes(10);
  const rows = codes.map((c) => ({
    user_id: enroll.userId,
    code_hash: hashRecoveryCode(normalizeRecoveryCodeInput(c)),
  }));
  const { error: insErr } = await supabase.from("auth_recovery_code").insert(rows);
  if (insErr) {
    await supabase
      .from("auth_user")
      .update({ totp_secret_encrypted: null, two_factor_enabled: false })
      .eq("id", enroll.userId);
    return { error: "Could not store recovery codes. Try again." };
  }

  await clearTotpEnrollmentCookie();
  return { ok: true, recoveryCodes: codes };
}

export async function disableTotpAction(_prev: TwofaFormState, formData: FormData): Promise<TwofaFormState> {
  const password = String(formData.get("password") ?? "");
  const s = await getSession();
  if (!s) return { error: "Sign in again." };

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("auth_user")
    .select("password_hash, two_factor_enabled")
    .eq("id", s.userId)
    .maybeSingle();

  if (!user?.two_factor_enabled) {
    return { error: "Two-factor authentication is not enabled." };
  }
  if (!user.password_hash) {
    return { error: "Set a password before disabling 2FA." };
  }

  const pwOk = await verifyPassword(password, user.password_hash);
  if (!pwOk) return { error: "Incorrect password." };

  await supabase
    .from("auth_user")
    .update({
      totp_secret_encrypted: null,
      two_factor_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", s.userId);
  await supabase.from("auth_recovery_code").delete().eq("user_id", s.userId);
  await deleteAllSessionsForUser(s.userId);
  await destroySession();
  redirect("/credentials/login?twofa_disabled=1");
}
