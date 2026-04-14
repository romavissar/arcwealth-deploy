"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getLevelFromXP, getXPProgressToNextLevel } from "@/lib/xp";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function XPBar({ fullWidth = false, className }: { fullWidth?: boolean; className?: string }) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setXp(d.xp ?? 0))
      .catch(() => {});
  }, []);

  const { percentage, current, required } = getXPProgressToNextLevel(xp);
  const level = getLevelFromXP(xp);

  return (
    <div
      className={cn(
        "items-center gap-2 rounded-xl border border-indigo-300/80 bg-indigo-50 px-2.5 py-1.5 dark:border-indigo-700/70 dark:bg-indigo-900/30",
        fullWidth ? "flex w-full" : "inline-flex w-[176px] shrink-0",
        className
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 dark:bg-indigo-400/20">
        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Lvl {level}</span>
          <span className="text-[11px] text-indigo-700/90 dark:text-indigo-200/90 tabular-nums">
            {current}/{required}
          </span>
        </div>
        <Progress value={percentage} className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-950" />
      </div>
    </div>
  );
}
