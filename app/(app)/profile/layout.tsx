import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileSubnav } from "@/components/profile/ProfileSubnav";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileSubnav />
      {children}
    </div>
  );
}
