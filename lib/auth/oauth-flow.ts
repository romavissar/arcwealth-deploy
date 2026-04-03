import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL, seedTopicsProgressForUser } from "@/lib/sync-user";

function newUserId(): string {
  return `usr_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function isStudentUser(supabase: ReturnType<typeof createServiceClient>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  return !!data;
}

export type OAuthFlowResult = { ok: true; userId: string } | { ok: false; code: "link_denied" | "db_error"; message: string };

/**
 * Find or create user for OAuth sign-in.
 * - Existing (provider, provider_account_id) → same user.
 * - Else if auth_user exists for email: link new oauth_account only when we trust email
 *   (provider says verified, or user already verified in DB).
 * - Else create auth_user + user_profiles + oauth_account + progress.
 */
export async function upsertOAuthUser(params: {
  provider: "google";
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
}): Promise<OAuthFlowResult> {
  const { provider, providerAccountId, email, emailVerified, firstName, lastName, picture } = params;
  const supabase = createServiceClient();
  const emailNorm = email.toLowerCase().trim();

  const { data: existingLink } = await supabase
    .from("oauth_account")
    .select("user_id")
    .eq("provider", provider)
    .eq("provider_account_id", providerAccountId)
    .maybeSingle();

  if (existingLink?.user_id) {
    const uid = existingLink.user_id;
    const now = new Date().toISOString();
    const student = await isStudentUser(supabase, uid);
    const { data: au } = await supabase.from("auth_user").select("email_verified_at").eq("id", uid).maybeSingle();
    const authUpdates: Record<string, unknown> = { updated_at: now };
    if (!student) {
      if (firstName != null) authUpdates.first_name = firstName;
      if (lastName != null) authUpdates.last_name = lastName;
    }
    if (emailVerified && !au?.email_verified_at) {
      authUpdates.email_verified_at = now;
    }
    await supabase.from("auth_user").update(authUpdates).eq("id", uid);
    if (!student && picture) {
      await supabase.from("user_profiles").update({ avatar_url: picture, updated_at: now }).eq("id", uid);
    }
    return { ok: true, userId: uid };
  }

  const { data: byEmail } = await supabase
    .from("auth_user")
    .select("id, email_verified_at")
    .eq("email", emailNorm)
    .maybeSingle();

  if (byEmail) {
    const trustEmail = emailVerified || !!byEmail.email_verified_at;
    if (!trustEmail) {
      return {
        ok: false,
        code: "link_denied",
        message: "An account with this email exists but is not verified. Sign in with password or verify your email first.",
      };
    }

    const { error: linkErr } = await supabase.from("oauth_account").insert({
      user_id: byEmail.id,
      provider,
      provider_account_id: providerAccountId,
    });
    if (linkErr) {
      return { ok: false, code: "db_error", message: linkErr.message };
    }

    const now = new Date().toISOString();
    const student = await isStudentUser(supabase, byEmail.id);
    const linkAuthUpdates: Record<string, unknown> = { updated_at: now };
    if (!student) {
      if (firstName != null) linkAuthUpdates.first_name = firstName;
      if (lastName != null) linkAuthUpdates.last_name = lastName;
    }
    if (emailVerified && !byEmail.email_verified_at) {
      linkAuthUpdates.email_verified_at = now;
    }
    await supabase.from("auth_user").update(linkAuthUpdates).eq("id", byEmail.id);

    if (!student && picture) {
      await supabase.from("user_profiles").update({ avatar_url: picture, updated_at: now }).eq("id", byEmail.id);
    }

    return { ok: true, userId: byEmail.id };
  }

  const userId = newUserId();
  const displayBase = `${firstName ?? "User"} ${lastName ?? ""}`.trim().slice(0, 40) || "user";
  const username = `${displayBase}_${userId.slice(-6)}`.slice(0, 50);
  const role = emailNorm === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
  const now = new Date().toISOString();

  const { error: e1 } = await supabase.from("auth_user").insert({
    id: userId,
    email: emailNorm,
    email_verified_at: emailVerified ? now : null,
    password_hash: null,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    birth_date: null,
  });
  if (e1) {
    return { ok: false, code: "db_error", message: e1.message };
  }

  const { error: e2 } = await supabase.from("user_profiles").insert({
    id: userId,
    username,
    email: emailNorm,
    role,
    rank: "novice",
    avatar_url: picture ?? null,
  });
  if (e2) {
    await supabase.from("auth_user").delete().eq("id", userId);
    return { ok: false, code: "db_error", message: e2.message };
  }

  const { error: e3 } = await supabase.from("oauth_account").insert({
    user_id: userId,
    provider,
    provider_account_id: providerAccountId,
  });
  if (e3) {
    await supabase.from("user_profiles").delete().eq("id", userId);
    await supabase.from("auth_user").delete().eq("id", userId);
    return { ok: false, code: "db_error", message: e3.message };
  }

  await seedTopicsProgressForUser(userId);
  return { ok: true, userId };
}
