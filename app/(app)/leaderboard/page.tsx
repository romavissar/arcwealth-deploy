import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getRankBySlug } from "@/lib/ranks";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  noStore();
  const supabase = createServiceClient();
  const [{ data: teacherRows }, { data: allProfiles }] = await Promise.all([
    supabase.from("teacher_list").select("user_id"),
    supabase
      .from("user_profiles")
      .select("id, username, xp, rank, avatar_url")
      .order("xp", { ascending: false })
      .limit(50),
  ]);
  const teacherIdSet = new Set((teacherRows ?? []).map((r) => r.user_id));
  const profiles = (allProfiles ?? []).filter((p) => !teacherIdSet.has(p.id)).slice(0, 20);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Weekly Leaderboard</h1>
      <ul className="space-y-2">
        {(profiles ?? []).map((p, i) => {
          const rankInfo = getRankBySlug(p.rank);
          return (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <span className="text-xl font-bold text-gray-400 dark:text-gray-500 w-8">#{i + 1}</span>
              {p.avatar_url ? (
                <Image
                  src={p.avatar_url}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full object-cover h-10 w-10 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-sm shrink-0">
                  {(p.username ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm shrink-0", rankInfo?.color ?? "bg-gray-100", rankInfo?.darkColor)}>
                {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">{p.username ?? "?"}</span>
              <span className="text-primary font-semibold shrink-0">{p.xp ?? 0} XP</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
