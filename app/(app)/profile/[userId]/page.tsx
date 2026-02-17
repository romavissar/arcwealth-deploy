import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { getPublicProfile, getFriendStatusForUsers, canViewProfile } from "@/app/actions/friends";
import { getRankBySlug } from "@/lib/ranks";
import { cn } from "@/lib/utils";
import { AddFriendButton } from "./AddFriendButton";

export default async function ProfileUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/sign-in");

  const { userId } = params;
  const ok = await canViewProfile(userId);
  if (!ok) notFound();

  const { error, profile } = await getPublicProfile(userId);
  if (error || !profile) notFound();

  const { statusByUserId } = await getFriendStatusForUsers([userId]);
  const friendStatus = statusByUserId?.[userId] ?? "none";

  const rank = getRankBySlug(profile.rank);
  const rankClass = rank ? `${rank.color} ${rank.darkColor ?? "dark:bg-gray-700 dark:text-gray-200"}` : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-24 w-24 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden shrink-0">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt="" width={96} height={96} className="object-cover w-full h-full" />
          ) : (
            <span>{profile.username?.[0] ?? "?"}</span>
          )}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.username}</h1>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium", rankClass)}>
            {rank?.icon} {rank?.title ?? profile.rank}
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Level {profile.level} · {profile.xp} XP</p>
          {currentUserId !== userId && (
            <div className="mt-3">
              <AddFriendButton targetUserId={userId} initialStatus={friendStatus} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">🔥 {profile.streakDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Day streak</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          <p className="text-2xl font-bold text-primary">{profile.xp}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.completedTopicCount}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Topics completed</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Achievements</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.achievementCount} earned</p>
      </div>
    </div>
  );
}
