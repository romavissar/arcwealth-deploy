"use client";

export function AlignmentMatrixChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="mb-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Cost →
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 p-4 text-center dark:border-rose-700 dark:bg-rose-950">
          <p className="text-xs font-semibold uppercase text-rose-800 dark:text-rose-100">High cost + Misaligned</p>
          <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">WORST</p>
          <p className="mt-1 text-xs text-gray-700 dark:text-rose-100">Eliminate — biggest regret</p>
        </div>
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-700 dark:bg-emerald-950">
          <p className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-100">High cost + Aligned</p>
          <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">INTENTIONAL</p>
          <p className="mt-1 text-xs text-gray-700 dark:text-emerald-100">Spend freely, guilt-free</p>
        </div>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-700 dark:bg-amber-950">
          <p className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-100">Low cost + Misaligned</p>
          <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">NEUTRAL</p>
          <p className="mt-1 text-xs text-gray-700 dark:text-amber-100">Minimize — spending leaks</p>
        </div>
        <div className="rounded-lg border-2 border-emerald-400 bg-emerald-100 p-4 text-center dark:border-emerald-600 dark:bg-emerald-950">
          <p className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-100">Low cost + Aligned</p>
          <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">BEST</p>
          <p className="mt-1 text-xs text-gray-700 dark:text-emerald-100">Maximize — highest ROI</p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-600 dark:text-gray-400">
        ↑ Values alignment. Goal: maximise Best & Intentional, minimise Worst & Neutral.
      </p>
    </div>
  );
}
