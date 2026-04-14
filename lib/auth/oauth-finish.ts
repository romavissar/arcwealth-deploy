import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession } from "./session";
import { getAppUrl } from "./oauth-config";
import { setTwoFactorPendingCookie } from "./two-factor-cookies";
import { resolvePostAuthRoute } from "./resolve-post-auth-route";

/** Issue JWT session and redirect after OAuth. */
export async function respondOAuthSession(userId: string): Promise<NextResponse> {
  await createSession(userId);
  const base = getAppUrl();
  const dest = await resolvePostAuthRoute(userId);
  return NextResponse.redirect(`${base}${dest}`);
}

/** OAuth callback: if 2FA is enabled, pending cookie + TOTP step; else full session. */
export async function respondAuthSuccessRedirect(userId: string): Promise<NextResponse> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("auth_user").select("two_factor_enabled").eq("id", userId).maybeSingle();
  const base = getAppUrl();
  if (data?.two_factor_enabled) {
    await setTwoFactorPendingCookie(userId);
    return NextResponse.redirect(`${base}/credentials/two-factor`);
  }
  return respondOAuthSession(userId);
}

export function redirectOAuthLoginError(code: string, message?: string): NextResponse {
  const u = new URL(`${getAppUrl()}/sign-in`);
  u.searchParams.set("oauth_error", code);
  if (message) u.searchParams.set("msg", message);
  return NextResponse.redirect(u);
}
