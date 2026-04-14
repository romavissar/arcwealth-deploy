import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAppUserId } from "@/lib/auth/server-user";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRankBySlug } from "@/lib/ranks";
import { getPublicProfile } from "@/app/actions/friends";
import { ProfileHeroCard } from "@/components/profile/ProfileHeroCard";
import { ProfileProgressModules } from "@/components/profile/ProfileProgressModules";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";

export default async function ProfilePage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const [{ profile, error }, { count: totalTopicCount }] = await Promise.all([
    getPublicProfile(userId),
    supabase.from("topics").select("topic_id", { count: "exact", head: true }),
  ]);
  if (error || !profile) redirect("/sign-in");

  const rank = getRankBySlug(profile.rank) ?? getRankBySlug("novice");
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/learn">Continue learning</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/textbook">Open textbook</Link>
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
        learningCtaLabel="Continue learning"
        learningCtaHref="/learn"
        textbookCtaLabel="Continue textbook"
        textbookCtaHref="/textbook"
      />

      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-primary/5 p-5 dark:border-[#8B5CF6]/45 dark:bg-primary/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Achievements</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You have earned {profile.achievementCount} achievement{profile.achievementCount === 1 ? "" : "s"} so far.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/profile/achievements">View all achievements</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
