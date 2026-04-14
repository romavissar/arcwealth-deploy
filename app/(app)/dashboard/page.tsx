import { createServiceClient } from "@/lib/supabase/server";
import { getAppUserId } from "@/lib/auth/server-user";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getXPProgressToNextLevel } from "@/lib/xp";
import { getRankBySlug } from "@/lib/ranks";
import { getLatestNudge } from "@/app/actions/nudge";
import { getLessonDescription, getLessonTitle, isKnownCurriculumTopic } from "@/lib/curriculum";
import { ProgressTrackCard } from "@/components/dashboard/ProgressTrackCard";
import { XPBar } from "@/components/ui/XPBar";
import { ArrowRight, BookOpenText, Flame, Send, Target, Trophy, Zap } from "lucide-react";

export default async function DashboardPage() {
  const userId = await getAppUserId();
  if (!userId) return null;

  const supabase = createServiceClient();
  const [profileRes, progressRes, topicsRes, nudge] = await Promise.all([
    supabase.from("user_profiles").select("username, xp, streak_days, rank, level").eq("id", userId).single(),
    supabase.from("user_progress").select("topic_id, status, completed_at").eq("user_id", userId),
    supabase.from("topics").select("topic_id, order_index").order("order_index"),
    getLatestNudge(),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data ?? [];
  const topics = (topicsRes.data ?? []).filter((topic) => isKnownCurriculumTopic(topic.topic_id));
  const progressByTopic = new Map(progress.map((row) => [row.topic_id, row.status as string]));
  const xp = profile?.xp ?? 0;
  const { percentage, current: xpInLevel, required: xpToNextLevel } = getXPProgressToNextLevel(xp);
  const rank = profile ? getRankBySlug(profile.rank ?? "novice") : null;
  const streakDays = profile?.streak_days ?? 0;
  const currentLevel = profile?.level ?? 1;

  let inProgressTopic: { topic_id: string } | undefined;
  let continueTopic: { topic_id: string } | undefined;
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const status = progressByTopic.get(topic.topic_id);
    if (status === "in_progress") inProgressTopic = topic;
    if (status === "available" || status === "in_progress") {
      continueTopic = topic;
      break;
    }
    if ((status === undefined || status === "locked") && i > 0 && progressByTopic.get(topics[i - 1].topic_id) === "completed") {
      continueTopic = topic;
      break;
    }
  }

  const currentTopicId = inProgressTopic?.topic_id ?? continueTopic?.topic_id ?? topics[0]?.topic_id ?? "—";
  const nextTopicId = continueTopic?.topic_id ?? topics[0]?.topic_id ?? null;
  const currentTopicTitle = currentTopicId === "—" ? "No lesson started yet" : getLessonTitle(currentTopicId);
  const nextTopicTitle = nextTopicId ? getLessonTitle(nextTopicId) : "Review your completed lessons";
  const nextTopicDescription = nextTopicId
    ? (getLessonDescription(nextTopicId) ?? "Keep your progress moving with one more lesson.")
    : "You have completed all current lessons. Revisit your favorites to stay sharp.";
  const nextLearnHref = nextTopicId ? `/learn/${nextTopicId}` : "/learn";
  const nextTextbookHref = nextTopicId ? `/textbook/${nextTopicId}` : "/textbook";

  const completedLessons = topics.filter((topic) => progressByTopic.get(topic.topic_id) === "completed").length;
  const totalLessons = topics.length;
  const textbookCompletionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const lessonsRemaining = Math.max(totalLessons - completedLessons, 0);
  const xpRemainingInLevel = Math.max(xpToNextLevel - xpInLevel, 0);
  const estimatedLessonsToLevelUp = Math.max(1, Math.ceil(xpRemainingInLevel / 10));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lessonsCompletedThisWeek = progress.filter((row) => {
    if (row.status !== "completed" || !row.completed_at) return false;
    const completedAt = new Date(row.completed_at);
    return !Number.isNaN(completedAt.getTime()) && completedAt >= oneWeekAgo;
  }).length;

  const momentumMessage =
    lessonsCompletedThisWeek >= 3
      ? "You are on a roll this week. Keep the streak alive."
      : lessonsCompletedThisWeek > 0
        ? "Nice momentum. One more lesson today keeps you climbing."
        : "Start a fresh streak today with one reading and one level.";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <section className="overflow-hidden rounded-2xl border border-indigo-500/80 bg-indigo-100/70 shadow-sm dark:border-indigo-500/90 dark:bg-indigo-900/35">
        <XPBar
          fullWidth
          className="rounded-none border-0 bg-transparent px-4 py-3"
        />
      </section>

      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-white p-5 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Momentum</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{momentumMessage}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">Streak</p>
            </div>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{streakDays} day{streakDays === 1 ? "" : "s"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">This week</p>
            </div>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{lessonsCompletedThisWeek} complete</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">All-time XP</p>
            </div>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{xp}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Ready for your next money mission{profile?.username ? `, ${profile.username}` : ""}?
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
              Next up is <span className="font-semibold text-gray-900 dark:text-gray-100">{nextTopicTitle}</span>. Lock in one
              textbook read and one level today to keep your streak and rank moving forward.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentLevel}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{streakDays}d</p>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 sm:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rank</p>
              <p className="break-words text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
                {rank?.title ?? "Novice"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {nudge && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-amber-200 p-2 text-amber-700 dark:bg-amber-800 dark:text-amber-200" aria-hidden="true">
                <Send className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{nudge.teacherUsername} nudged you to keep going</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {nudge.nextTopicId ? `Suggested next lesson: ${getLessonTitle(nudge.nextTopicId)}` : "You are doing great. Stay consistent."}
                </p>
              </div>
            </div>
            {nudge.nextTopicId && (
              <Button asChild size="sm">
                <Link href={`/learn/${nudge.nextTopicId}`}>Jump to lesson</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressTrackCard
          icon={Zap}
          eyebrow="Level Path"
          title={`Level ${currentLevel} in progress`}
          description={`Current mission: ${currentTopicTitle}`}
          progressLabel={`${xpInLevel}/${xpToNextLevel} XP in this level`}
          progressValue={percentage}
          ctaLabel="Continue Level"
          ctaHref={nextLearnHref}
          metrics={[
            { label: "XP to unlock", value: `${xpRemainingInLevel}` },
            { label: "Est. lessons", value: `${estimatedLessonsToLevelUp}` },
          ]}
          className="border-[#8B5CF6]/55 dark:border-[#8B5CF6]/45"
        />

        <ProgressTrackCard
          icon={BookOpenText}
          eyebrow="Textbook Track"
          title={nextTopicTitle}
          description={nextTopicDescription}
          progressLabel={`${completedLessons}/${totalLessons || 0} lessons read`}
          progressValue={textbookCompletionPercent}
          ctaLabel="Continue Textbook"
          ctaHref={nextTextbookHref}
          metrics={[
            { label: "Completion", value: `${textbookCompletionPercent}%` },
            { label: "Lessons left", value: `${lessonsRemaining}` },
          ]}
          className="border-amber-200 dark:border-amber-900/50"
        />
      </section>

      <section className="rounded-2xl border-2 border-[#8B5CF6]/55 bg-primary/5 p-5 dark:border-[#8B5CF6]/45 dark:bg-primary/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pick your next win</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Keep your progress loop tight: read first, then complete the level challenge.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="sm:min-w-44">
              <Link href={nextLearnHref}>
                Continue Level
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="sm:min-w-44">
              <Link href={nextTextbookHref}>Continue Textbook</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
