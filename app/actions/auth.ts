"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { isPasswordLoginEnabled } from "@/lib/auth/app-config";
import { completePasswordLoginOrTwoFactor } from "@/lib/auth/login-complete";
import { safeInternalPath } from "@/lib/auth/safe-redirect";
import { destroySession } from "@/lib/auth/session";
import { sendGuardianRegistrationNotice, sendVerificationEmail } from "@/lib/email/auth-emails";
import { ADMIN_EMAIL, seedTopicsProgressForUser } from "@/lib/sync-user";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().max(max).optional()
  );

const requiredText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "This field is required.").max(max)
  );

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"] as const;
const PARENTAL_AGREEMENT_VERSION = "2026-04-15";
const PARENTAL_APPROVAL_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAgeFromBirthDate(isoDate: string): number | null {
  const birth = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  acceptTerms: z.preprocess((value) => value === "true", z.literal(true, { errorMap: () => ({ message: "You must accept the User Agreement." }) })),
  acceptPrivacy: z.preprocess(
    (value) => value === "true",
    z.literal(true, { errorMap: () => ({ message: "You must acknowledge the Privacy Policy." }) })
  ),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guardianEmail: z.preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().email().max(320).optional()
  ),
  school: requiredText(160),
  country: requiredText(100),
  city: requiredText(100),
  gender: z.enum(genderOptions),
  gradeLevel: optionalText(60),
  learningGoal: optionalText(200),
}).superRefine((value, ctx) => {
  const age = getAgeFromBirthDate(value.birthDate);
  if (age !== null && age < 18 && !value.guardianEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["guardianEmail"],
      message: "Guardian email is required for students under 18.",
    });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

function newUserId(): string {
  return `usr_${crypto.randomUUID().replace(/-/g, "")}`;
}

export type AuthFormState = { error?: string; ok?: boolean } | null;
export type VerifyEmailCodeState = { error?: string; ok?: boolean } | null;

function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmailWithTimeout(
  email: string,
  verificationCode: string,
  verifyUrl: string
): Promise<{ error?: string }> {
  const sendPromise = sendVerificationEmail(email, { verificationCode, verifyUrl });
  const timeoutPromise = new Promise<{ error: string }>((resolve) => {
    setTimeout(() => resolve({ error: "Verification email timed out. Please try again." }), 10000);
  });
  return Promise.race([sendPromise, timeoutPromise]);
}

async function sendGuardianNoticeWithTimeout(
  guardianEmail: string,
  input: { studentName: string; studentEmail: string; school?: string; approvalUrl?: string; expiresAt?: string }
): Promise<{ error?: string }> {
  const sendPromise = sendGuardianRegistrationNotice(guardianEmail, input);
  const timeoutPromise = new Promise<{ error: string }>((resolve) => {
    setTimeout(() => resolve({ error: "Guardian notification email timed out." }), 10000);
  });
  return Promise.race([sendPromise, timeoutPromise]);
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await isPasswordLoginEnabled())) {
    return { error: "Email and password registration is disabled." };
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many registration attempts. Try again later." };
  }

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    acceptTerms: formData.get("acceptTerms"),
    acceptPrivacy: formData.get("acceptPrivacy"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    guardianEmail: formData.get("guardianEmail"),
    school: formData.get("school"),
    country: formData.get("country"),
    city: formData.get("city"),
    gender: formData.get("gender"),
    gradeLevel: formData.get("gradeLevel"),
    learningGoal: formData.get("learningGoal"),
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Invalid input." };
  }

  const { email, password, firstName, lastName, birthDate, guardianEmail, school, country, city, gender, gradeLevel, learningGoal } =
    parsed.data;
  const age = getAgeFromBirthDate(birthDate);
  const requiresParentalApproval = age !== null && age < 18;
  const emailNorm = email.toLowerCase();
  const supabase = createServiceClient();

  const { data: existing } = await supabase.from("auth_user").select("id").eq("email", emailNorm).maybeSingle();
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const userId = newUserId();
  const passwordHash = await hashPassword(password);
  const username = `${firstName} ${lastName}`.trim().slice(0, 50) || "user";
  const role = emailNorm === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

  const { error: e1 } = await supabase.from("auth_user").insert({
    id: userId,
    email: emailNorm,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    parental_approval_required: requiresParentalApproval,
    parental_approval_requested_at: requiresParentalApproval ? new Date().toISOString() : null,
    parental_approved_at: null,
    parental_approver_name: null,
    parental_agreement_version: requiresParentalApproval ? PARENTAL_AGREEMENT_VERSION : null,
    email_verified_at: null,
  });
  if (e1) {
    return { error: e1.message ?? "Could not create account." };
  }

  const { error: e2 } = await supabase.from("user_profiles").insert({
    id: userId,
    username,
    email: emailNorm,
    role,
    rank: "novice",
    birth_date: birthDate,
    school,
    country,
    city,
    gender,
    grade_level: gradeLevel,
    learning_goal: learningGoal,
    guardian_email: guardianEmail,
  });
  if (e2) {
    await supabase.from("auth_user").delete().eq("id", userId);
    const maybeMissingColumn = /Could not find the '.+' column of 'user_profiles' in the schema cache/i.test(
      e2.message ?? ""
    );
    if (maybeMissingColumn) {
      return {
        error:
          "Signup schema is out of date. Apply Supabase migrations 019, 020, and 021 (or run the SQL in Supabase) and try again.",
      };
    }
    return { error: e2.message ?? "Could not create profile." };
  }

  await seedTopicsProgressForUser(userId);

  await supabase.from("auth_token").delete().eq("user_id", userId).eq("purpose", "email_verification");

  const rawToken = generateOpaqueToken();
  const verificationCode = generateVerificationCode();
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: e3 } = await supabase.from("auth_token").insert([
    {
      user_id: userId,
      token_hash: hashToken(rawToken),
      purpose: "email_verification",
      expires_at: tokenExpires,
    },
    {
      user_id: userId,
      token_hash: hashToken(verificationCode),
      purpose: "email_verification",
      expires_at: tokenExpires,
    },
  ]);
  if (e3) {
    return { error: "Account created but verification could not be queued. Contact support." };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const send = await sendVerificationEmailWithTimeout(emailNorm, verificationCode, verifyUrl);
  if (send.error && process.env.NODE_ENV === "production") {
    return { error: send.error };
  }

  if (guardianEmail) {
    let parentalApprovalUrl: string | undefined;
    let parentalApprovalExpiresAt: string | undefined;
    if (requiresParentalApproval) {
      await supabase.from("auth_token").delete().eq("user_id", userId).eq("purpose", "parental_approval");
      const rawParentalToken = generateOpaqueToken();
      parentalApprovalExpiresAt = new Date(Date.now() + PARENTAL_APPROVAL_LINK_TTL_MS).toISOString();
      const { error: parentalTokenError } = await supabase.from("auth_token").insert({
        user_id: userId,
        token_hash: hashToken(rawParentalToken),
        purpose: "parental_approval",
        expires_at: parentalApprovalExpiresAt,
      });
      if (parentalTokenError) {
        return { error: "Account created but parental approval link could not be generated. Contact support." };
      }
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      parentalApprovalUrl = `${base}/parental-agreement/authorize?token=${encodeURIComponent(rawParentalToken)}`;
    }

    const guardianSend = await sendGuardianNoticeWithTimeout(guardianEmail, {
      studentName: `${firstName} ${lastName}`.trim() || "A student",
      studentEmail: emailNorm,
      school,
      approvalUrl: parentalApprovalUrl,
      expiresAt: parentalApprovalExpiresAt,
    });
    if (guardianSend.error && process.env.NODE_ENV === "development") {
      console.warn("[auth-email] Guardian notification failed:", guardianSend.error);
    }
  }

  redirect(`/verify-email?email=${encodeURIComponent(emailNorm)}&sent=1`);
}

export async function verifyEmailCodeAction(
  _prev: VerifyEmailCodeState,
  formData: FormData
): Promise<VerifyEmailCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codeRaw = String(formData.get("code") ?? "").trim();
  const code = codeRaw.replace(/\s+/g, "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit verification code." };
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase.from("auth_user").select("id, email_verified_at").eq("email", email).maybeSingle();
  if (!user) {
    return { error: "No account found for this email." };
  }
  if (user.email_verified_at) {
    redirect("/sign-in?verified=1");
  }

  const { data: row } = await supabase
    .from("auth_token")
    .select("id, expires_at, used_at")
    .eq("user_id", user.id)
    .eq("purpose", "email_verification")
    .eq("token_hash", hashToken(code))
    .maybeSingle();

  if (!row || row.used_at) {
    return { error: "Invalid verification code." };
  }
  if (new Date(row.expires_at) < new Date()) {
    return { error: "This code has expired. Request a new one." };
  }

  const now = new Date().toISOString();
  await supabase.from("auth_user").update({ email_verified_at: now, updated_at: now }).eq("id", user.id);
  await supabase.from("auth_token").update({ used_at: now }).eq("id", row.id);

  redirect("/sign-in?verified=1");
}

export async function resendVerificationCodeAction(
  _prev: VerifyEmailCodeState,
  formData: FormData
): Promise<VerifyEmailCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address first." };
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase.from("auth_user").select("id, email_verified_at").eq("email", email).maybeSingle();
  if (!user) {
    return { error: "No account found for this email." };
  }
  if (user.email_verified_at) {
    return { ok: true };
  }

  await supabase.from("auth_token").delete().eq("user_id", user.id).eq("purpose", "email_verification");

  const rawToken = generateOpaqueToken();
  const verificationCode = generateVerificationCode();
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: insertError } = await supabase.from("auth_token").insert([
    {
      user_id: user.id,
      token_hash: hashToken(rawToken),
      purpose: "email_verification",
      expires_at: tokenExpires,
    },
    {
      user_id: user.id,
      token_hash: hashToken(verificationCode),
      purpose: "email_verification",
      expires_at: tokenExpires,
    },
  ]);
  if (insertError) {
    return { error: "Could not generate a new code. Please try again." };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const send = await sendVerificationEmailWithTimeout(email, verificationCode, verifyUrl);
  if (send.error && process.env.NODE_ENV === "production") {
    return { error: send.error };
  }
  return { ok: true };
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await isPasswordLoginEnabled())) {
    return { error: "Email and password login is disabled." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  const emailNorm = parsed.data.email.toLowerCase();
  if (!checkRateLimit(`login:${emailNorm}`, 20, 15 * 60 * 1000)) {
    return { error: "Too many login attempts. Try again in a few minutes." };
  }

  const supabase = createServiceClient();
  const { data: user, error } = await supabase
    .from("auth_user")
    .select("id, password_hash, email_verified_at, parental_approval_required, parental_approved_at")
    .eq("email", emailNorm)
    .maybeSingle();

  if (error || !user?.password_hash) {
    return { error: "Invalid email or password." };
  }

  const ok = await verifyPassword(parsed.data.password, user.password_hash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  if (!user.email_verified_at) {
    return { error: "Please verify your email before signing in. Check your inbox for the link." };
  }

  if (user.parental_approval_required && !user.parental_approved_at) {
    return {
      error:
        "Parent/guardian authorization is required before this account can sign in. Ask your parent to use the authorization link sent to their email.",
    };
  }

  const nextPath = safeInternalPath(formData.get("redirect_url"));
  await completePasswordLoginOrTwoFactor(user.id, nextPath);
  return null;
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/sign-in");
}

/** End session and return to the marketing home page. */
export async function signOutFromAppAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
