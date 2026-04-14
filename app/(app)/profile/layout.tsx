import { getAppUserId } from "@/lib/auth/server-user";
import { redirect } from "next/navigation";
import { ProfileSubnav } from "@/components/profile/ProfileSubnav";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <ProfileSubnav />
      {children}
    </div>
  );
}
