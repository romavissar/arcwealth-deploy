import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export const TWOFA_PENDING_COOKIE = "arcwealth_2fa_pending";
export const TOTP_ENROLL_COOKIE = "arcwealth_totp_enroll";

const pendingOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 300,
});

const enrollOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
});

export async function setTwoFactorPendingCookie(userId: string): Promise<void> {
  const token = await new SignJWT({ typ: "2fa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getSecret());
  const store = await cookies();
  store.set(TWOFA_PENDING_COOKIE, token, pendingOpts());
}

export async function getTwoFactorPendingUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(TWOFA_PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (payload.typ !== "2fa_pending") return null;
    const sub = payload.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

export async function clearTwoFactorPendingCookie(): Promise<void> {
  const store = await cookies();
  store.delete(TWOFA_PENDING_COOKIE);
}

export async function setTotpEnrollmentCookie(userId: string, secretBase32: string): Promise<void> {
  const token = await new SignJWT({ typ: "totp_enroll", sec: secretBase32 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
  const store = await cookies();
  store.set(TOTP_ENROLL_COOKIE, token, enrollOpts());
}

export async function getTotpEnrollmentState(): Promise<{ userId: string; secret: string } | null> {
  const store = await cookies();
  const token = store.get(TOTP_ENROLL_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (payload.typ !== "totp_enroll" || typeof payload.sec !== "string") return null;
    const sub = payload.sub;
    if (typeof sub !== "string") return null;
    return { userId: sub, secret: payload.sec };
  } catch {
    return null;
  }
}

export async function clearTotpEnrollmentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(TOTP_ENROLL_COOKIE);
}

/** After successful 2FA step, drop pending cookie and ensure no half session cookie leaked. */
export async function clearLoginChallengeCookies(): Promise<void> {
  await clearTwoFactorPendingCookie();
}
