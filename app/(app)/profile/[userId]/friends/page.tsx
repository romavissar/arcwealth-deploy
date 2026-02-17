import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { canViewProfile, getPublicFriends, getPublicProfile } from "@/app/actions/friends";

export default async function ProfileUserFriendsPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/sign-in");

  const { userId } = params;
  const ok = await canViewProfile(userId);
  if (!ok) notFound();

  const [{ profile }, { error, friends }] = await Promise.all([
    getPublicProfile(userId),
    getPublicFriends(userId),
  ]);
  if (error || !profile) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {profile.username}&apos;s friends
      </h1>
      {!friends?.length ? (
        <p className="text-gray-500 dark:text-gray-400">No friends yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {friends.map((f) => (
            <li key={f.id}>
              <Link
                href={`/profile/${f.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="relative h-10 w-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                  {f.avatarUrl ? (
                    <Image
                      src={f.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span>{f.username?.[0] ?? "?"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {f.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Level {f.level}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
