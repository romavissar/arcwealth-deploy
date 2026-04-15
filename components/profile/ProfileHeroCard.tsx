import Image from "next/image";
import { cn } from "@/lib/utils";
import { subtleFallbackAvatarBorderClass } from "@/components/ui/avatar-fallback";

interface ProfileHeroCardProps {
  username: string;
  avatarUrl: string | null;
  rankTitle: string;
  rankIcon?: string;
  rankClassName?: string;
  level: number;
  xp: number;
  weeklyXp: number;
  lessonsCompletedThisWeek: number;
  actionSlot?: React.ReactNode;
}

export function ProfileHeroCard({
  username,
  avatarUrl,
  rankTitle,
  rankIcon,
  rankClassName,
  level,
  xp,
  weeklyXp,
  lessonsCompletedThisWeek,
  actionSlot,
}: ProfileHeroCardProps) {
  return (
    <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 dark:border-primary/40 dark:bg-primary/20">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={`${username} avatar`} width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center text-3xl font-bold text-primary ${subtleFallbackAvatarBorderClass}`}>
                {username[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Profile</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{username}</h1>
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
                rankClassName ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              )}
            >
              {rankIcon ? <span aria-hidden="true">{rankIcon}</span> : null}
              {rankTitle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{level}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total XP</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{xp}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Weekly XP</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{weeklyXp}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{lessonsCompletedThisWeek} done</p>
          </div>
        </div>
      </div>

      {actionSlot ? <div className="mt-5">{actionSlot}</div> : null}
    </section>
  );
}
