"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setStreak(d.streak_days ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-amber-300/80 bg-amber-50 font-semibold text-amber-800 dark:border-amber-700/70 dark:bg-amber-900/30 dark:text-amber-200 ${
        compact ? "gap-1.5 px-2 py-1 text-xs" : "gap-2 px-2.5 py-1.5 text-sm"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-md bg-amber-500/15 dark:bg-amber-400/20 ${
          compact ? "h-5 w-5" : "h-6 w-6"
        }`}
      >
        <Flame className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} text-amber-600 dark:text-amber-300`} aria-hidden="true" />
      </span>
      <span className="tabular-nums">{streak}</span>
    </div>
  );
}
