import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { syncAchievements } from "@/app/actions/progress";

export default async function AchievementsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await syncAchievements();

  const supabase = createServiceClient();
  const [achievements, earned] = await Promise.all([
    supabase.from("achievements").select("slug, title, description, icon, xp_reward").order("slug"),
    supabase.from("user_achievements").select("achievement_slug").eq("user_id", userId),
  ]);

  const earnedSet = new Set((earned.data ?? []).map((e) => e.achievement_slug));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Achievements</h1>
      <div className="grid gap-4">
        {(achievements.data ?? []).map((a) => (
          <div
            key={a.slug}
            className={`rounded-xl border p-4 flex items-center gap-4 ${
              earnedSet.has(a.slug)
                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30"
                : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-90 dark:opacity-80"
            }`}
          >
            <span className="text-3xl">{a.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{a.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{a.description}</p>
              {a.xp_reward > 0 && (
                <p className="text-xs text-primary mt-1">+{a.xp_reward} XP</p>
              )}
            </div>
            {earnedSet.has(a.slug) && <span className="text-green-600 dark:text-green-400">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
