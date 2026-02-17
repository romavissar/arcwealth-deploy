import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getRankBySlug } from "@/lib/ranks";

export const dynamic = "force-dynamic";

export default async function LeaderboardDailyPage() {
  noStore();
  const supabase = createServiceClient();
  const dayAgo = new Date();
  dayAgo.setHours(dayAgo.getHours() - 24);

  const [{ data: teacherRows }, { data: events }] = await Promise.all([
    supabase.from("teacher_list").select("user_id"),
    supabase
      .from("xp_events")
      .select("user_id, amount")
      .gte("created_at", dayAgo.toISOString()),
  ]);
  const teacherIdSet = new Set((teacherRows ?? []).map((r) => r.user_id));

  const xpByUser = new Map<string, number>();
  for (const e of events ?? []) {
    if (teacherIdSet.has(e.user_id)) continue;
    xpByUser.set(e.user_id, (xpByUser.get(e.user_id) ?? 0) + (e.amount ?? 0));
  }
  const topEntries = [...xpByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  const topIds = topEntries.map(([id]) => id);
  const xpMap = new Map(topEntries);

  if (topIds.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Daily Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400">No XP earned in the last 24 hours. Complete lessons and quizzes to appear here!</p>
      </>
    );
  }

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, rank, avatar_url")
    .in("id", topIds);

  const ordered = topIds
    .map((id) => profiles?.find((p) => p.id === id))
    .filter(Boolean) as { id: string; username: string | null; rank: string | null; avatar_url: string | null }[];

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Daily Leaderboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">XP earned in the last 24 hours</p>
      <ul className="space-y-2">
        {ordered.map((p, i) => {
          const rankInfo = getRankBySlug(p.rank ?? "novice");
          const xp = xpMap.get(p.id) ?? 0;
          return (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <span className="text-xl font-bold text-gray-400 dark:text-gray-500 w-8 shrink-0">#{i + 1}</span>
              <Link href={`/profile/${p.id}`} className="flex items-center gap-2 min-w-0 flex-1">
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
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.username ?? "?"}</span>
              </Link>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm shrink-0", rankInfo?.color ?? "bg-gray-100", rankInfo?.darkColor)}>
                {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"}
              </span>
              <span className="text-primary font-semibold shrink-0 ml-auto">{xp} XP</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
