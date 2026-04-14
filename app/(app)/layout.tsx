import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ensureUserInSupabase } from "@/lib/sync-user";
import { getCurrentUserRole } from "@/lib/roles";
import { getMyNotifications } from "@/app/actions/nudge";
import { getAppUserId, getAppUserSyncFields } from "@/lib/auth/server-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAppUserId();
  let role: "admin" | "teacher" | "student" | "user" | null = null;
  let primaryEmail: string | undefined;
  let avatarUrl: string | undefined;
  let notifications: Awaited<ReturnType<typeof getMyNotifications>> = [];
  if (userId) {
    const sync = await getAppUserSyncFields(userId);
    primaryEmail = sync.email;
    avatarUrl = sync.imageUrl;
    await ensureUserInSupabase(userId, {
      username: sync.username,
      imageUrl: sync.imageUrl,
      email: sync.email,
    });
    role = await getCurrentUserRole();
    notifications = await getMyNotifications();
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={role} primaryEmail={primaryEmail} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        <TopBar notifications={notifications} primaryEmail={primaryEmail} avatarUrl={avatarUrl} />
        <main className="flex-1 p-4 md:p-6 text-gray-900 dark:text-gray-100">{children}</main>
      </div>
    </div>
  );
}
