"use client";

import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Brain, BookOpenText, ChevronDown, Crown, Landmark, Sprout, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankBySlug, RANKS } from "@/lib/ranks";

const rankVisuals = {
  novice: {
    Icon: Sprout,
    chip: "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
    iconWrap: "bg-slate-500/15 dark:bg-slate-400/20",
    icon: "text-slate-500 dark:text-slate-300",
  },
  apprentice: {
    Icon: BookOpenText,
    chip: "border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-200",
    iconWrap: "bg-emerald-500/15 dark:bg-emerald-400/20",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  practitioner: {
    Icon: Landmark,
    chip: "border-blue-300/80 bg-blue-50 text-blue-700 dark:border-blue-700/70 dark:bg-blue-900/30 dark:text-blue-200",
    iconWrap: "bg-blue-500/15 dark:bg-blue-400/20",
    icon: "text-blue-600 dark:text-blue-300",
  },
  strategist: {
    Icon: TrendingUp,
    chip: "border-violet-300/80 bg-violet-50 text-violet-700 dark:border-violet-700/70 dark:bg-violet-900/30 dark:text-violet-200",
    iconWrap: "bg-violet-500/15 dark:bg-violet-400/20",
    icon: "text-violet-600 dark:text-violet-300",
  },
  expert: {
    Icon: Brain,
    chip: "border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-700/70 dark:bg-rose-900/30 dark:text-rose-200",
    iconWrap: "bg-rose-500/15 dark:bg-rose-400/20",
    icon: "text-rose-600 dark:text-rose-300",
  },
  hero: {
    Icon: Crown,
    chip: "border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-700/70 dark:bg-amber-900/30 dark:text-amber-200",
    iconWrap: "bg-amber-500/15 dark:bg-amber-400/20",
    icon: "text-amber-600 dark:text-amber-300",
  },
} as const;

function getRankVisual(slug: string) {
  return rankVisuals[slug as keyof typeof rankVisuals] ?? rankVisuals.novice;
}

export function RankBadge() {
  const [rankSlug, setRankSlug] = useState<string>("novice");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setRankSlug(d.rank ?? "novice"))
      .catch(() => {});
  }, []);

  const rank = getRankBySlug(rankSlug);
  const currentVisual = getRankVisual(rank?.slug ?? "novice");
  const CurrentIcon = currentVisual.Icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm font-semibold transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900",
            currentVisual.chip
          )}
          aria-label={`Current rank: ${rank?.title ?? "Novice"}`}
        >
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", currentVisual.iconWrap)}>
            <CurrentIcon className={cn("h-3.5 w-3.5", currentVisual.icon)} />
          </span>
          <span>{rank?.title ?? "Novice"}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          className="w-[340px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Rank Journey</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Master each stage to become Financial Hero.</p>
          </div>
          <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
            {RANKS.map((entry) => {
              const visual = getRankVisual(entry.slug);
              const RankIcon = visual.Icon;
              const isCurrent = entry.slug === rank?.slug;
              return (
                <article
                  key={entry.slug}
                  className={cn(
                    "rounded-xl border px-3 py-2",
                    isCurrent
                      ? "border-primary/40 bg-primary/5 dark:border-primary/50 dark:bg-primary/15"
                      : "border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", visual.iconWrap)}>
                      <RankIcon className={cn("h-4 w-4", visual.icon)} />
                    </span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {entry.title}
                      {isCurrent ? <span className="ml-2 text-xs font-medium text-primary">Current</span> : null}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{entry.description}</p>
                </article>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
