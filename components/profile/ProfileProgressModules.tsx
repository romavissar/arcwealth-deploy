import { BookOpenText, Rocket, Target } from "lucide-react";
import { ProgressTrackCard } from "@/components/dashboard/ProgressTrackCard";

interface ProfileProgressModulesProps {
  xpInLevel: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
  lessonsCompletedThisWeek: number;
  weeklyXp: number;
  completedTopicCount: number;
  totalTopicCount: number;
  achievementCount: number;
  learningCtaLabel: string;
  learningCtaHref: string;
  textbookCtaLabel: string;
  textbookCtaHref: string;
}

export function ProfileProgressModules({
  xpInLevel,
  xpToNextLevel,
  xpProgressPercent,
  lessonsCompletedThisWeek,
  weeklyXp,
  completedTopicCount,
  totalTopicCount,
  achievementCount,
  learningCtaLabel,
  learningCtaHref,
  textbookCtaLabel,
  textbookCtaHref,
}: ProfileProgressModulesProps) {
  const completionPercent =
    totalTopicCount > 0 ? Math.min(100, Math.round((completedTopicCount / totalTopicCount) * 100)) : 0;
  const topicsRemaining = Math.max(totalTopicCount - completedTopicCount, 0);
  const xpRemainingInLevel = Math.max(xpToNextLevel - xpInLevel, 0);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <ProgressTrackCard
        icon={Rocket}
        eyebrow="Level Progress"
        title="Momentum to next level"
        description="Track weekly consistency and XP gains to keep leveling up."
        progressLabel={`${xpInLevel}/${xpToNextLevel} XP in current level`}
        progressValue={xpProgressPercent}
        ctaLabel={learningCtaLabel}
        ctaHref={learningCtaHref}
        metrics={[
          { label: "XP to unlock", value: `${xpRemainingInLevel}` },
          { label: "This week", value: `${weeklyXp} XP` },
        ]}
        className="border-[#8B5CF6]/55 dark:border-[#8B5CF6]/45"
      />

      <ProgressTrackCard
        icon={BookOpenText}
        eyebrow="Learning Impact"
        title="Curriculum completion"
        description="Visible progress across lessons and achievements earned."
        progressLabel={`${completedTopicCount}/${totalTopicCount} lessons completed`}
        progressValue={completionPercent}
        ctaLabel={textbookCtaLabel}
        ctaHref={textbookCtaHref}
        metrics={[
          { label: "Lessons left", value: `${topicsRemaining}` },
          { label: "Achievements", value: `${achievementCount}` },
        ]}
        className="border-amber-200 dark:border-amber-900/50"
      />

      <div className="rounded-2xl border border-[#8B5CF6]/55 bg-white p-5 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60 lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Weekly activity</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Consistency keeps rank climbing</h3>
          </div>
          <span className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20" aria-hidden="true">
            <Target className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {lessonsCompletedThisWeek >= 3
            ? "Strong pace this week. Keep this rhythm to maintain profile momentum."
            : lessonsCompletedThisWeek > 0
              ? "Good momentum. One more completed lesson will strengthen this week's profile activity."
              : "No lessons completed this week yet. Start one lesson to kick off momentum."}
        </p>
      </div>
    </section>
  );
}
