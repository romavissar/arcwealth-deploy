import { getAppUserId } from "@/lib/auth/server-user";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { syncAchievements } from "@/app/actions/progress";
import { Award, CheckCircle2, Lock, Sparkles } from "lucide-react";

export default async function AchievementsPage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  await syncAchievements();

  const supabase = createServiceClient();
  const [achievements, earned] = await Promise.all([
    supabase.from("achievements").select("slug, title, description, icon, xp_reward").order("slug"),
    supabase.from("user_achievements").select("achievement_slug").eq("user_id", userId),
  ]);

  const achievementList = achievements.data ?? [];
  const earnedSet = new Set((earned.data ?? []).map((e) => e.achievement_slug));
  const earnedCount = achievementList.filter((achievement) => earnedSet.has(achievement.slug)).length;
  const totalXp = achievementList.reduce((sum, achievement) => sum + Math.max(achievement.xp_reward ?? 0, 0), 0);
  const earnedXp = achievementList
    .filter((achievement) => earnedSet.has(achievement.slug))
    .reduce((sum, achievement) => sum + Math.max(achievement.xp_reward ?? 0, 0), 0);
  const completionPercent =
    achievementList.length > 0 ? Math.round((earnedCount / achievementList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Profile progress</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Achievements
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Track every milestone you unlock as you build your ArcWealth learning streak.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {completionPercent}% complete
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Unlocked</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
              {earnedCount}/{achievementList.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">XP earned</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{earnedXp}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">XP available</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{totalXp}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-white p-5 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Achievement library</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Earn badges by completing lessons, quizzes, and consistency milestones.
            </p>
          </div>
          <span className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20" aria-hidden="true">
            <Award className="h-5 w-5" />
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {achievementList.map((achievement) => {
            const isEarned = earnedSet.has(achievement.slug);

            return (
              <article
                key={achievement.slug}
                className={`rounded-xl border p-4 shadow-sm transition-colors ${
                  isEarned
                    ? "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-900/20"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl ${
                      isEarned
                        ? "border-amber-300 bg-white/90 dark:border-amber-700 dark:bg-amber-900/40"
                        : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                    }`}
                    aria-hidden="true"
                  >
                    {achievement.icon ?? "🏆"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{achievement.title}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isEarned
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {isEarned ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
                        {isEarned ? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                    {achievement.xp_reward > 0 ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        +{achievement.xp_reward} XP reward
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
