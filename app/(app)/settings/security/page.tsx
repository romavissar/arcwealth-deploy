import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";

export default async function SettingsSecurityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent />
    </AccountSettingsLayout>
  );
}
