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
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Daily standings
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Top learners today</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          XP earned in the last 24 hours.
        </p>
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
          No XP earned in the last 24 hours. Complete lessons and quizzes to appear here.
        </div>
      </section>
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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Daily standings
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Top learners today</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">XP earned in the last 24 hours.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-right dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-xs text-gray-500 dark:text-gray-400">Shown</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ordered.length} learners</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {ordered.map((p, i) => {
          const rankInfo = getRankBySlug(p.rank ?? "novice");
          const xp = xpMap.get(p.id) ?? 0;
          return (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                #{i + 1}
              </span>
              <Link
                href={`/profile/${p.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {p.avatar_url ? (
                  <Image
                    src={p.avatar_url}
                    alt={`${p.username ?? "Learner"} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover h-10 w-10 shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-sm shrink-0">
                    {(p.username ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">{p.username ?? "?"}</span>
              </Link>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm",
                  rankInfo?.color ?? "bg-gray-100",
                  rankInfo?.darkColor
                )}
              >
                {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"}
              </span>
              <div className="ml-auto shrink-0 text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">XP</p>
                <p className="font-semibold text-primary">{xp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
