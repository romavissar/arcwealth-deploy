"use client";

const ROWS = [
  { label: "Gross salary", amount: 35000, isDeduction: false },
  { label: "Income tax", amount: -5200, isDeduction: true },
  { label: "Social insurance", amount: -1400, isDeduction: true },
  { label: "USC / levies", amount: -1020, isDeduction: true },
  { label: "Pension (employee)", amount: -1750, isDeduction: true },
  { label: "Net take-home", amount: 25630, isDeduction: false },
];

export function GrossToNetChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        From gross to net — €35,000 example (illustrative; total deductions 26.8%)
      </p>
      <div className="mx-auto max-w-sm space-y-2">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between rounded px-3 py-2 text-sm ${
              row.isDeduction
                ? "bg-rose-50/80 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                : row.label === "Net take-home"
                  ? "bg-emerald-100 font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            <span>{row.label}</span>
            <span>
              {row.amount >= 0 ? `€${row.amount.toLocaleString()}` : `−€${Math.abs(row.amount).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-gray-600 dark:text-gray-400">
        Always budget on net — the money that actually arrives
      </p>
    </div>
  );
}
