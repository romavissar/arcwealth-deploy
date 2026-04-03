import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateState, getAppleOAuth, OAUTH_COOKIE_APPLE_STATE, oauthCookieOptions } from "@/lib/auth/oauth-config";
import { redirectOAuthLoginError } from "@/lib/auth/oauth-finish";

export async function GET() {
  const apple = getAppleOAuth();
  if (!apple) {
    return redirectOAuthLoginError("apple_config");
  }
  const state = generateState();
  const url = apple.createAuthorizationURL(state, ["name", "email"]);
  const store = await cookies();
  store.set(OAUTH_COOKIE_APPLE_STATE, state, oauthCookieOptions());
  return NextResponse.redirect(url.toString());
}
