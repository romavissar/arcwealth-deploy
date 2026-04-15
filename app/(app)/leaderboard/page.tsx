import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getRankBySlug } from "@/lib/ranks";
import { subtleFallbackAvatarBorderClass } from "@/components/ui/avatar-fallback";

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
    <section
      data-tour-id="leaderboard-overview"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            All-time standings
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Top learners by total XP</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Rankings update as students complete more lessons, quizzes, and challenges.
          </p>
        </div>
        <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left dark:border-gray-700 dark:bg-gray-800/70 sm:w-auto sm:text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Shown</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{profiles.length} learners</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {(profiles ?? []).map((p, i) => {
          const rankInfo = getRankBySlug(p.rank);
          return (
            <li key={p.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    #{i + 1}
                  </span>
                  <Link
                    href={`/profile/${p.id}`}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    {p.avatar_url ? (
                      <Image
                        src={p.avatar_url}
                        alt={`${p.username ?? "Learner"} avatar`}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary ${subtleFallbackAvatarBorderClass}`}
                      >
                        {(p.username ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                      {p.username ?? "?"}
                    </span>
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-3 sm:ml-auto sm:min-w-fit sm:justify-end">
                  <span
                    className={cn(
                      "inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs sm:text-sm",
                      rankInfo?.color ?? "bg-gray-100",
                      rankInfo?.darkColor
                    )}
                  >
                    {rankInfo?.icon ?? "🌱"} {rankInfo?.title ?? "Novice"}
                  </span>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">XP</p>
                    <p className="font-semibold leading-none text-primary">{p.xp ?? 0}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
