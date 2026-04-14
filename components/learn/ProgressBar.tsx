"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  /** Accuracy 0–100; shown next to bar. Green ≥80%, red <80%. */
  accuracy?: number | null;
  sectionLabel?: string;
}

export function ProgressBar({ current, total, accuracy, sectionLabel }: ProgressBarProps) {
  const value = total > 0 ? (current / total) * 100 : 0;
  const showAccuracy = typeof accuracy === "number";
  const accuracyGreen = showAccuracy && accuracy >= 80;
  return (
    <div className="flex items-center gap-2 w-full max-w-sm">
      <Progress value={value} className="h-2.5 flex-1 min-w-0" />
      <span className="text-xs text-[var(--text-muted)] shrink-0">{current}/{total}</span>
      {sectionLabel && (
        <span className="hidden sm:inline-flex rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {sectionLabel}
        </span>
      )}
      {showAccuracy && (
        <span
          className="text-xs font-medium shrink-0"
          style={{ color: accuracyGreen ? "var(--emerald-border)" : "var(--red-border)" }}
        >
          {accuracy}%
        </span>
      )}
    </div>
  );
}
