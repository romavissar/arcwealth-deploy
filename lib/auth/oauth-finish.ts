import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession } from "./session";
import { getAppUrl } from "./oauth-config";
import { setTwoFactorPendingCookie } from "./two-factor-cookies";

/** Issue JWT session and redirect (matches password login + Clerk migration flag). */
export async function respondOAuthSession(userId: string): Promise<NextResponse> {
  await createSession(userId);
  const base = getAppUrl();
  if (process.env.USE_LEGACY_CLERK !== "false") {
    return NextResponse.redirect(`${base}/credentials/login?custom_session=1`);
  }
  return NextResponse.redirect(`${base}/dashboard`);
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
  const u = new URL(`${getAppUrl()}/credentials/login`);
  u.searchParams.set("oauth_error", code);
  if (message) u.searchParams.set("msg", message);
  return NextResponse.redirect(u);
}
