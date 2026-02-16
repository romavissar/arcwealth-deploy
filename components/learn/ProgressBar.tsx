"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  /** Accuracy 0–100; shown next to bar. Green ≥80%, red <80%. */
  accuracy?: number | null;
}

export function ProgressBar({ current, total, accuracy }: ProgressBarProps) {
  const value = total > 0 ? (current / total) * 100 : 0;
  const showAccuracy = typeof accuracy === "number";
  const accuracyGreen = showAccuracy && accuracy >= 80;
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <Progress value={value} className="h-2 flex-1 min-w-0" />
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{current}/{total}</span>
      {showAccuracy && (
        <span
          className={`text-xs font-medium shrink-0 ${accuracyGreen ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {accuracy}%
        </span>
      )}
    </div>
  );
}
