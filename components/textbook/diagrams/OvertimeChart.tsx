"use client";

const RATES = [
  { type: "Standard (e.g. first 40h)", multiplier: "1×", rate: "€15.00", example: "40h × €15 = €600" },
  { type: "Time-and-a-half (overtime)", multiplier: "1.5×", rate: "€22.50", example: "10h × €22.50 = €225" },
  { type: "Double time (e.g. weekend)", multiplier: "2×", rate: "€30.00", example: "8h × €30 = €240" },
  { type: "Holiday / premium", multiplier: "2.5×", rate: "€37.50", example: "4h × €37.50 = €150" },
];

export function OvertimeChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Overtime multipliers — base rate €15/hour (rates vary by country and contract)
      </p>
      <div className="space-y-2">
        {RATES.map((r) => (
          <div
            key={r.type}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 dark:border-primary/40 dark:bg-primary/20"
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">{r.type}</span>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">({r.multiplier})</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold text-primary">{r.rate}</span>
              <span className="text-gray-600 dark:text-gray-300">{r.example}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
