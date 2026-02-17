import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountSettingsLayout } from "@/components/account/AccountSettingsLayout";
import { AccountSettingsContent } from "@/components/account/AccountSettingsContent";
import { getMyClassroomTeacherId } from "@/app/actions/classroom";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Restrict name/email only when the user is assigned to a teacher (in student_teacher)
  const teacherId = await getMyClassroomTeacherId();
  const restrictNameEmail = !!teacherId;

  return (
    <AccountSettingsLayout>
      <AccountSettingsContent isStudent={restrictNameEmail} />
    </AccountSettingsLayout>
  );
}
