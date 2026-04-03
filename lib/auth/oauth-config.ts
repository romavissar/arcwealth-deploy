import { Google, generateState, generateCodeVerifier } from "arctic";

export { generateState, generateCodeVerifier };

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const OAUTH_COOKIE_GOOGLE_STATE = "oauth_google_state";
export const OAUTH_COOKIE_GOOGLE_CV = "oauth_google_cv";

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
