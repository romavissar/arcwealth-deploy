import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createServiceClient } from "@/lib/supabase/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "./constants";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters for custom auth");
  }
  return new TextEncoder().encode(secret);
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export interface AppSession {
  userId: string;
  sessionId: string;
}

/**
 * Issue a DB session row + signed JWT cookie. Caller must ensure `userId` exists in `auth_user`.
 */
export async function createSession(userId: string): Promise<void> {
  const supabase = createServiceClient();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000).toISOString();
  const { error } = await supabase.from("auth_session").insert({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const token = await new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, cookieOptions());
}

/** Read and verify session from cookie (Server Components / Actions). */
export async function getSession(): Promise<AppSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const userId = payload.sub;
    const sessionId = payload.sid;
    if (typeof userId !== "string" || typeof sessionId !== "string") return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AppSession> {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}

/** Clear session cookie and delete DB row (best-effort). */
export async function destroySession(): Promise<void> {
  const s = await getSession();
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  if (s?.sessionId) {
    const supabase = createServiceClient();
    await supabase.from("auth_session").delete().eq("id", s.sessionId);
  }
}

/** Invalidate every session for a user (e.g. password reset). */
export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("auth_session").delete().eq("user_id", userId);
}
