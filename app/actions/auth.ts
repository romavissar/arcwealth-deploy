"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { isPasswordLoginEnabled } from "@/lib/auth/app-config";
import { createSession, destroySession } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email/auth-emails";
import { ADMIN_EMAIL, seedTopicsProgressForUser } from "@/lib/sync-user";

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Invalid input." };
  }

  const { email, password, firstName, lastName, birthDate } = parsed.data;
  const emailNorm = email.toLowerCase();
  const supabase = createServiceClient();

  const { data: existing } = await supabase.from("auth_user").select("id").eq("email", emailNorm).maybeSingle();
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const userId = newUserId();
  const passwordHash = await hashPassword(password);
  const username = `${firstName} ${lastName}`.slice(0, 50);
  const role = emailNorm === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

  const { error: e1 } = await supabase.from("auth_user").insert({
    id: userId,
    email: emailNorm,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
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
  });
  if (e2) {
    await supabase.from("auth_user").delete().eq("id", userId);
    return { error: e2.message ?? "Could not create profile." };
  }

  await seedTopicsProgressForUser(userId);

  await supabase.from("auth_token").delete().eq("user_id", userId).eq("purpose", "email_verification");

  const rawToken = generateOpaqueToken();
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: e3 } = await supabase.from("auth_token").insert({
    user_id: userId,
    token_hash: hashToken(rawToken),
    purpose: "email_verification",
    expires_at: tokenExpires,
  });
  if (e3) {
    return { error: "Account created but verification could not be queued. Contact support." };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const send = await sendVerificationEmail(emailNorm, verifyUrl);
  if (send.error && process.env.NODE_ENV === "production") {
    return { error: send.error };
  }

  redirect("/credentials/login?registered=1");
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
    .select("id, password_hash, email_verified_at")
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

  try {
    await createSession(user.id);
  } catch {
    return {
      error:
        "Session could not be created. Set AUTH_SECRET (32+ chars) in .env.local for custom login.",
    };
  }

  if (process.env.USE_LEGACY_CLERK !== "false") {
    redirect("/credentials/login?custom_session=1");
  }
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/credentials/login");
}
