"use client";

const STAGES = [
  { num: 1, label: "Scarcity belief", short: "“There’s never enough”" },
  { num: 2, label: "Fear-based choices", short: "Hoard, avoid risk, short-term" },
  { num: 3, label: "Missed opportunities", short: "Don’t invest, don’t take risks" },
  { num: 4, label: "Poor outcomes", short: "Stagnation, no growth" },
  { num: 5, label: "Reinforced belief", short: "“See? I was right.”" },
  { num: 6, label: "Increased anxiety", short: "Stronger fear, narrower focus" },
];

export function ScarcitySpiralChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex flex-wrap justify-center gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.num} className="flex items-center gap-1.5">
            <div className="flex min-w-[110px] flex-col rounded-lg border-2 border-rose-200 bg-rose-50 px-2 py-2 text-center dark:border-rose-800 dark:bg-rose-950 sm:min-w-[130px]">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Stage {stage.num}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stage.label}</span>
              <span className="text-xs text-gray-700 dark:text-rose-100">{stage.short}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-rose-400 dark:text-rose-400" aria-hidden>→</span>
            )}
            {i === STAGES.length - 1 && (
              <span className="text-rose-500 dark:text-rose-400" aria-hidden>↻</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Break the spiral by changing behaviour despite the belief — act your way out
      </p>
    </div>
  );
}
