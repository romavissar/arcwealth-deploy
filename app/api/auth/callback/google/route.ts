import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getGoogleOAuth,
  OAUTH_COOKIE_GOOGLE_CV,
  OAUTH_COOKIE_GOOGLE_STATE,
} from "@/lib/auth/oauth-config";
import { upsertOAuthUser } from "@/lib/auth/oauth-flow";
import { redirectOAuthLoginError, respondAuthSuccessRedirect } from "@/lib/auth/oauth-finish";

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function GET(req: NextRequest) {
  const google = getGoogleOAuth();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  if (err) return redirectOAuthLoginError(err);
  if (!code || !state) return redirectOAuthLoginError("missing");
  const store = await cookies();
  const savedState = store.get(OAUTH_COOKIE_GOOGLE_STATE)?.value;
  const codeVerifier = store.get(OAUTH_COOKIE_GOOGLE_CV)?.value;
  store.delete(OAUTH_COOKIE_GOOGLE_STATE);
  store.delete(OAUTH_COOKIE_GOOGLE_CV);
  if (!savedState || !codeVerifier || savedState !== state) {
    return redirectOAuthLoginError("state");
  }
  if (!google) return redirectOAuthLoginError("google_config");
  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return redirectOAuthLoginError("token");
  }
  const access = tokens.accessToken();
  const ures = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!ures.ok) return redirectOAuthLoginError("userinfo");
  const u = (await ures.json()) as GoogleUserInfo;
  if (!u.email) return redirectOAuthLoginError("no_email");
  const result = await upsertOAuthUser({
    provider: "google",
    providerAccountId: u.sub,
    email: u.email,
    emailVerified: !!u.email_verified,
    firstName: u.given_name ?? null,
    lastName: u.family_name ?? null,
    picture: u.picture ?? null,
  });
  if (!result.ok) {
    return redirectOAuthLoginError(result.code === "link_denied" ? "link_denied" : "db", result.message);
  }
  try {
    return await respondAuthSuccessRedirect(result.userId);
  } catch {
    return redirectOAuthLoginError("session");
  }
}
