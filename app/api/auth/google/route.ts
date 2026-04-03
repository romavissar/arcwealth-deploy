import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateCodeVerifier,
  generateState,
  getGoogleOAuth,
  OAUTH_COOKIE_GOOGLE_CV,
  OAUTH_COOKIE_GOOGLE_STATE,
  oauthCookieOptions,
} from "@/lib/auth/oauth-config";
import { redirectOAuthLoginError } from "@/lib/auth/oauth-finish";

export async function GET() {
  const google = getGoogleOAuth();
  if (!google) {
    return redirectOAuthLoginError("google_config");
  }
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);
  const opts = oauthCookieOptions();
  const store = await cookies();
  store.set(OAUTH_COOKIE_GOOGLE_STATE, state, opts);
  store.set(OAUTH_COOKIE_GOOGLE_CV, codeVerifier, opts);
  return NextResponse.redirect(url.toString());
}
