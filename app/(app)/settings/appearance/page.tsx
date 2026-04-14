import { getAppUserId } from "@/lib/auth/server-user";
import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";

export default async function SettingsAppearancePage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent />
    </AccountSettingsLayout>
  );
}
