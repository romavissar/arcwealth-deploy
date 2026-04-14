import { Award, BookCheck, Flame, Trophy, Users } from "lucide-react";

interface ProfileStatsGridProps {
  streakDays: number;
  xp: number;
  completedTopicCount: number;
  achievementCount: number;
  allTimeRank: number | null;
}

const statCardClassName =
  "rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800";

export function ProfileStatsGrid({
  streakDays,
  xp,
  completedTopicCount,
  achievementCount,
  allTimeRank,
}: ProfileStatsGridProps) {
  return (
    <section className="rounded-2xl border border-[#8B5CF6]/55 bg-white p-5 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">At a glance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Public learning snapshot and milestones.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={statCardClassName}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Streak</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{streakDays}d</p>
        </div>

        <div className={statCardClassName}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Total XP</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{xp}</p>
        </div>

        <div className={statCardClassName}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <BookCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Completed</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{completedTopicCount}</p>
        </div>

        <div className={statCardClassName}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Achievements</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{achievementCount}</p>
        </div>

        <div className={statCardClassName}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">All-time rank</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{allTimeRank ? `#${allTimeRank}` : "—"}</p>
        </div>
      </div>
    </section>
  );
}
