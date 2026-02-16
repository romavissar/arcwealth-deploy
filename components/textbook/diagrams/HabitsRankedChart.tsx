"use client";

const HABITS = [
  { name: "Automate savings", impact: 95 },
  { name: "Invest consistently", impact: 90 },
  { name: "Track spending weekly", impact: 88 },
  { name: "Negotiate income regularly", impact: 86 },
  { name: "Review finances monthly", impact: 85 },
  { name: "Avoid lifestyle inflation", impact: 82 },
  { name: "Learn continuously", impact: 78 },
  { name: "Build emergency buffer", impact: 75 },
  { name: "Delay non-essential purchases", impact: 72 },
  { name: "Consume financial content", impact: 68 },
];

export function HabitsRankedChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
      <p className="mb-3 text-center text-xs font-semibold text-gray-900 dark:text-gray-100 sm:text-sm">
        10 wealth-building habits ranked by long-term impact
      </p>
      <div className="space-y-1">
        {HABITS.map((h, i) => (
          <div key={h.name} className="grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,2fr)_2.25rem] items-center gap-2">
            <span className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">{i + 1}.</span>
            <div className="min-w-0 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded bg-primary/80 dark:bg-primary"
                style={{ width: `${h.impact}%`, minWidth: "2px" }}
              />
            </div>
            <span className="min-w-0 text-xs font-semibold text-gray-900 dark:text-gray-100 truncate" title={h.name}>
              {h.name}
            </span>
            <span className="text-right text-xs font-semibold text-primary">{h.impact}%</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">All compound significantly over decades</p>
    </div>
  );
}
