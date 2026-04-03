import { createServiceClient } from "@/lib/supabase/server";

/**
 * Password login can be disabled via env `FEATURE_PASSWORD_LOGIN=false` or
 * `app_config.feature_password_login` JSON false (Wave 2+).
 */
export async function isPasswordLoginEnabled(): Promise<boolean> {
  if (process.env.FEATURE_PASSWORD_LOGIN === "false") return false;
  if (process.env.FEATURE_PASSWORD_LOGIN === "true") return true;
  const supabase = createServiceClient();
  const { data } = await supabase.from("app_config").select("value").eq("key", "feature_password_login").maybeSingle();
  if (data?.value === false) return false;
  return true;
}
