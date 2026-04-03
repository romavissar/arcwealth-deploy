import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { safeInternalPath } from "./safe-redirect";
import { createSession } from "./session";
import { setTwoFactorPendingCookie } from "./two-factor-cookies";

/**
 * After email+password verification (or equivalent). If 2FA is on, set pending cookie and
 * send user to the TOTP step; otherwise issue a full session.
 */
export async function completePasswordLoginOrTwoFactor(
  userId: string,
  redirectAfterLogin?: string | null
): Promise<never> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("auth_user").select("two_factor_enabled").eq("id", userId).maybeSingle();
  if (data?.two_factor_enabled) {
    await setTwoFactorPendingCookie(userId);
    return redirect("/credentials/two-factor");
  }
  try {
    await createSession(userId);
  } catch {
    return redirect("/sign-in");
  }
  if (process.env.USE_LEGACY_CLERK !== "false") {
    return redirect("/sign-in?custom_session=1");
  }
  const dest = safeInternalPath(redirectAfterLogin) ?? "/dashboard";
  return redirect(dest);
}
