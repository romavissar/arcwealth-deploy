import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";
import { getMyClassroomTeacherId } from "@/app/actions/classroom";
import { createServiceClient } from "@/lib/supabase/server";
import { getAppUserId } from "@/lib/auth/server-user";

export default async function SettingsSecurityPage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  const teacherId = await getMyClassroomTeacherId();
  const restrictNameEmail = !!teacherId;

  const supabase = createServiceClient();
  const { data: au } = await supabase
    .from("auth_user")
    .select("two_factor_enabled")
    .eq("id", userId)
    .maybeSingle();
  const { count } = await supabase
    .from("auth_recovery_code")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("used_at", null);
  const twoFactorState = {
    enabled: !!au?.two_factor_enabled,
    recoveryRemaining: count ?? 0,
  };

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent isStudent={restrictNameEmail} twoFactorState={twoFactorState} />
    </AccountSettingsLayout>
  );
}
