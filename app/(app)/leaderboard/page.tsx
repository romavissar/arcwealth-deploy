import { createServiceClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getRankBySlug } from "@/lib/ranks";

export default async function LeaderboardPage() {
  const supabase = createServiceClient();
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("username, xp, rank")
    .order("xp", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Weekly Leaderboard</h1>
      <ul className="space-y-2">
        {(profiles ?? []).map((p, i) => {
          const rankInfo = getRankBySlug(p.rank);
          return (
            <li
              key={p.username}
              className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <span className="text-xl font-bold text-gray-400 dark:text-gray-500 w-8">#{i + 1}</span>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm", rankInfo?.color ?? "bg-gray-100", rankInfo?.darkColor)}>
                {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-1">{p.username}</span>
              <span className="text-primary font-semibold">{p.xp} XP</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
