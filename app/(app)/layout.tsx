import { auth, currentUser } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ensureUserInSupabase } from "@/lib/sync-user";
import { getCurrentUserRole } from "@/lib/roles";
import { getMyNotifications } from "@/app/actions/nudge";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let role: "admin" | "teacher" | "student" | "user" | null = null;
  let primaryEmail: string | undefined;
  let notifications: Awaited<ReturnType<typeof getMyNotifications>> = [];
  if (userId) {
    const user = await currentUser();
    const displayName = user?.username
      || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]
      || undefined;
    primaryEmail = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? undefined;
    await ensureUserInSupabase(userId, {
      username: displayName,
      imageUrl: user?.imageUrl ?? undefined,
      email: primaryEmail,
    });
    role = await getCurrentUserRole();
    notifications = await getMyNotifications();
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={role} primaryEmail={primaryEmail} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        <TopBar notifications={notifications} />
        <main className="flex-1 p-4 md:p-6 text-gray-900 dark:text-gray-100">{children}</main>
      </div>
    </div>
  );
}
