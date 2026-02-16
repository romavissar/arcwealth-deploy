"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const value = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 w-32">
      <Progress value={value} className="h-2 flex-1" />
      <span className="text-xs text-gray-500">{current}/{total}</span>
    </div>
  );
}
