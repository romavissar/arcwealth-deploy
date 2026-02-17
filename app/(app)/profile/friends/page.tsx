import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFriends, removeFriend } from "@/app/actions/friends";
import { getRankBySlug } from "@/lib/ranks";
import { cn } from "@/lib/utils";
import { RemoveFriendButton } from "./RemoveFriendButton";

export default async function ProfileFriendsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { error, friends } = await getFriends();
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Friends</h1>
      {!friends?.length ? (
        <p className="text-gray-500 dark:text-gray-400">You have no friends yet. Add friends from the Leaderboard or Classroom.</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((f) => {
            const rankInfo = getRankBySlug(f.rank);
            return (
              <li
                key={f.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
              >
                <Link href={`/profile/${f.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                  {f.avatarUrl ? (
                    <Image
                      src={f.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-sm shrink-0">
                      {f.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{f.username}</p>
                    <p className={cn("text-xs inline-flex items-center gap-1 rounded-full px-2 py-0.5", rankInfo?.color ?? "bg-gray-100", rankInfo?.darkColor)}>
                      {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"} · Level {f.level}
                    </p>
                  </div>
                </Link>
                <RemoveFriendButton friendUserId={f.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
