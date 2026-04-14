"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export function StreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setStreak(d.streak_days ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-2.5 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-700/70 dark:bg-amber-900/30 dark:text-amber-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/15 dark:bg-amber-400/20">
        <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
      </span>
      <span className="tabular-nums">{streak}</span>
    </div>
  );
}
