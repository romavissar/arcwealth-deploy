"use client";

const correctMonthly = 2136;
const wrongMonthly = 1710;
const lossPerMonth = 426;
const lossPerYear = 5112;

export function TaxCodeImpactChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Wrong tax code (0T) vs correct (1250L) on €35,000 salary — illustrative UK-style
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-center text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            Correct code (1250L)
          </p>
          <p className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            €{correctMonthly.toLocaleString()}/month
          </p>
          <p className="text-center text-xs text-gray-600 dark:text-gray-300">Net take-home</p>
        </div>
        <div className="rounded-lg border-2 border-rose-200 bg-rose-50/80 p-4 dark:border-rose-800 dark:bg-rose-950/40">
          <p className="text-center text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">
            Wrong code (0T / emergency)
          </p>
          <p className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            €{wrongMonthly.toLocaleString()}/month
          </p>
          <p className="text-center text-xs text-rose-600 dark:text-rose-300">
            You lose €{lossPerMonth}/month = €{lossPerYear.toLocaleString()}/year
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-rose-700 dark:text-rose-300">
        Check your tax code on your first payslip — get it corrected within a month
      </p>
    </div>
  );
}
