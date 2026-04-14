import { getAppUserId } from "@/lib/auth/server-user";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfile, getFriendStatusForUsers, canViewProfile } from "@/app/actions/friends";
import { getRankBySlug } from "@/lib/ranks";
import { AddFriendButton } from "./AddFriendButton";
import { ProfileHeroCard } from "@/components/profile/ProfileHeroCard";
import { ProfileProgressModules } from "@/components/profile/ProfileProgressModules";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function ProfileUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const currentUserId = await getAppUserId();
  if (!currentUserId) redirect("/sign-in");

  const { userId } = params;
  const ok = await canViewProfile(userId);
  if (!ok) notFound();

  const supabase = createServiceClient();
  const [{ error, profile }, { count: totalTopicCount }] = await Promise.all([
    getPublicProfile(userId),
    supabase.from("topics").select("topic_id", { count: "exact", head: true }),
  ]);
  if (error || !profile) notFound();

  const { statusByUserId } = await getFriendStatusForUsers([userId]);
  const friendStatus = statusByUserId?.[userId] ?? "none";

  const rank = getRankBySlug(profile.rank);
  const rankClass = rank ? `${rank.color} ${rank.darkColor ?? "dark:bg-gray-700 dark:text-gray-200"}` : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  return (
    <div className="space-y-6">
      <ProfileHeroCard
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        rankTitle={rank?.title ?? profile.rank}
        rankIcon={rank?.icon}
        rankClassName={rankClass}
        level={profile.level}
        xp={profile.xp}
        weeklyXp={profile.weeklyXp}
        lessonsCompletedThisWeek={profile.lessonsCompletedThisWeek}
        actionSlot={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {currentUserId !== userId ? (
              <AddFriendButton targetUserId={userId} initialStatus={friendStatus} />
            ) : null}
            <Button asChild variant="secondary">
              <Link href={`/profile/${userId}/friends`}>View friends</Link>
            </Button>
          </div>
        }
      />

      <ProfileStatsGrid
        streakDays={profile.streakDays}
        xp={profile.xp}
        completedTopicCount={profile.completedTopicCount}
        achievementCount={profile.achievementCount}
        allTimeRank={profile.allTimeRank}
      />

      <ProfileProgressModules
        xpInLevel={profile.xpInLevel}
        xpToNextLevel={profile.xpToNextLevel}
        xpProgressPercent={profile.xpProgressPercent}
        lessonsCompletedThisWeek={profile.lessonsCompletedThisWeek}
        weeklyXp={profile.weeklyXp}
        completedTopicCount={profile.completedTopicCount}
        totalTopicCount={totalTopicCount ?? 0}
        achievementCount={profile.achievementCount}
        learningCtaLabel="Explore leaderboard"
        learningCtaHref="/leaderboard"
        textbookCtaLabel="Browse textbook"
        textbookCtaHref="/textbook"
      />

      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-primary/5 p-5 dark:border-[#8B5CF6]/45 dark:bg-primary/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Achievements</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {profile.username} has earned {profile.achievementCount} achievement{profile.achievementCount === 1 ? "" : "s"}.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/profile/${userId}/friends`}>See social graph</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
