import { Google, Apple, generateState, generateCodeVerifier } from "arctic";

export { generateState, generateCodeVerifier };

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const OAUTH_COOKIE_GOOGLE_STATE = "oauth_google_state";
export const OAUTH_COOKIE_GOOGLE_CV = "oauth_google_cv";
export const OAUTH_COOKIE_APPLE_STATE = "oauth_apple_state";

export function oauthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
}

export function getGoogleOAuth(): Google | null {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect =
    process.env.GOOGLE_REDIRECT_URI ?? `${getAppUrl()}/api/auth/callback/google`;
  if (!id || !secret) return null;
  return new Google(id, secret, redirect);
}

/** PKCS#8 DER bytes from PEM (Apple .p8). */
export function applePrivateKeyFromPem(pem: string): Uint8Array | null {
  const trimmed = pem.replace(/\\n/g, "\n").trim();
  const match = trimmed.match(/-----BEGIN PRIVATE KEY-----([\s\S]+)-----END PRIVATE KEY-----/);
  if (!match) return null;
  const b64 = match[1].replace(/\s/g, "");
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export function getAppleOAuth(): Apple | null {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const pem = process.env.APPLE_PRIVATE_KEY_PEM;
  const redirect = process.env.APPLE_REDIRECT_URI ?? `${getAppUrl()}/api/auth/callback/apple`;
  if (!clientId || !teamId || !keyId || !pem) return null;
  const keyBytes = applePrivateKeyFromPem(pem);
  if (!keyBytes) return null;
  return new Apple(clientId, teamId, keyId, keyBytes, redirect);
}
