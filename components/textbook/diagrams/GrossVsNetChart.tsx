"use client";

const BREAKDOWN = [
  { label: "Gross salary", amount: 35000, isDeduction: false },
  { label: "Income tax", amount: -5200, isDeduction: true },
  { label: "Social insurance", amount: -1400, isDeduction: true },
  { label: "USC / levies", amount: -1020, isDeduction: true },
  { label: "Pension (employee)", amount: -1750, isDeduction: true },
  { label: "Net take-home", amount: 25630, isDeduction: false },
];

const gross = 35000;
const net = 25630;
const pct = ((net / gross) * 100).toFixed(1);

export function GrossVsNetChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Gross vs net — example €35,000 salary (illustrative; actual deductions vary by country)
      </p>
      <div className="mx-auto max-w-sm space-y-2">
        {BREAKDOWN.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between rounded px-3 py-2 text-sm font-medium ${
              row.isDeduction
                ? "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100"
                : row.label === "Net take-home"
                  ? "bg-emerald-100 font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            <span>{row.label}</span>
            <span>
              {row.amount >= 0 ? `€${row.amount.toLocaleString()}` : `−€${Math.abs(row.amount).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-gray-700 dark:text-gray-300">
        Take-home is ~{pct}% of gross — always plan your budget from net
      </p>
    </div>
  );
}
