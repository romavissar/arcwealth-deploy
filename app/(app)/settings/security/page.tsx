import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";
import { getMyClassroomTeacherId } from "@/app/actions/classroom";

export default async function SettingsSecurityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const teacherId = await getMyClassroomTeacherId();
  const restrictNameEmail = !!teacherId;

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent isStudent={restrictNameEmail} />
    </AccountSettingsLayout>
  );
}
