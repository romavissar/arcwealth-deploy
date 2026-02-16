import { auth, currentUser } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ensureUserInSupabase } from "@/lib/sync-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    const displayName = user?.username
      || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]
      || undefined;
    await ensureUserInSupabase(userId, {
      username: displayName,
      imageUrl: user?.imageUrl ?? undefined,
    });
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
