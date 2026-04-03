import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";
import { getMyClassroomTeacherId } from "@/app/actions/classroom";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export default async function SettingsSecurityPage() {
  const useLegacyClerk = process.env.USE_LEGACY_CLERK !== "false";
  const custom = await getSession();

  if (!useLegacyClerk && !custom) {
    redirect("/credentials/login");
  }

  if (useLegacyClerk) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  const teacherId = await getMyClassroomTeacherId();
  const restrictNameEmail = !!teacherId;

  let twoFactorState: { enabled: boolean; recoveryRemaining: number } | null = null;
  if (custom) {
    const supabase = createServiceClient();
    const { data: au } = await supabase
      .from("auth_user")
      .select("two_factor_enabled")
      .eq("id", custom.userId)
      .maybeSingle();
    const { count } = await supabase
      .from("auth_recovery_code")
      .select("id", { count: "exact", head: true })
      .eq("user_id", custom.userId)
      .is("used_at", null);
    twoFactorState = {
      enabled: !!au?.two_factor_enabled,
      recoveryRemaining: count ?? 0,
    };
  }

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent isStudent={restrictNameEmail} twoFactorState={twoFactorState} />
    </AccountSettingsLayout>
  );
}
