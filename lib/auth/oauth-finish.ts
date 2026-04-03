import { NextResponse } from "next/server";
import { createSession } from "./session";
import { getAppUrl } from "./oauth-config";

/** Issue JWT session and redirect (matches password login + Clerk migration flag). */
export async function respondOAuthSession(userId: string): Promise<NextResponse> {
  await createSession(userId);
  const base = getAppUrl();
  if (process.env.USE_LEGACY_CLERK !== "false") {
    return NextResponse.redirect(`${base}/credentials/login?custom_session=1`);
  }
  return NextResponse.redirect(`${base}/dashboard`);
}

export function redirectOAuthLoginError(code: string, message?: string): NextResponse {
  const u = new URL(`${getAppUrl()}/credentials/login`);
  u.searchParams.set("oauth_error", code);
  if (message) u.searchParams.set("msg", message);
  return NextResponse.redirect(u);
}
