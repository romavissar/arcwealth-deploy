"use client";

export function BudgetingMistakeChart() {
  const grossMonthly = 2917;
  const netMonthly = 2136;
  const shortfall = grossMonthly - netMonthly;

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        The most expensive budgeting mistake: planning on gross vs planning on net
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-rose-200 bg-rose-50/80 p-4 dark:border-rose-800 dark:bg-rose-950/40">
          <p className="text-center text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">
            Wrong: budget on gross
          </p>
          <p className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            €2,917
          </p>
          <p className="text-center text-xs text-gray-600 dark:text-gray-300">€35k ÷ 12 (monthly)</p>
          <p className="mt-2 text-center text-sm text-rose-700 dark:text-rose-300">
            Actual pay = €2,136 → short €781 every month
          </p>
        </div>
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-center text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            Right: budget on net
          </p>
          <p className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            €2,136
          </p>
          <p className="text-center text-xs text-gray-600 dark:text-gray-300">€25,630 ÷ 12 (take-home)</p>
          <p className="mt-2 text-center text-sm text-emerald-700 dark:text-emerald-300">
            Budget totals €2,136 or less — no shortfall
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-rose-700 dark:text-rose-300">
        Shortfall: €{shortfall}/month = €{shortfall * 12}/year
      </p>
    </div>
  );
}
