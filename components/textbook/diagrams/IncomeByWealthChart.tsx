"use client";

const DATA = [
  { tier: "Bottom 40%", active: 96, portfolio: 3, passive: 1 },
  { tier: "Middle 40%", active: 88, portfolio: 8, passive: 4 },
  { tier: "Top 15%", active: 68, portfolio: 18, passive: 14 },
  { tier: "Top 5%", active: 32, portfolio: 38, passive: 30 },
];

const COLORS = {
  active: "#3b82f6",
  portfolio: "#059669",
  passive: "#d97706",
};

export function IncomeByWealthChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Where income comes from across wealth levels — illustrative
      </p>
      <div className="space-y-4">
        {DATA.map((row) => (
          <div key={row.tier}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-gray-900 dark:text-gray-100">{row.tier}</span>
              <span className="text-gray-700 dark:text-gray-300">
                A {row.active}% · P {row.portfolio}% · Pa {row.passive}%
              </span>
            </div>
            <div className="flex h-8 overflow-hidden rounded-md">
              <div
                style={{ width: `${row.active}%`, backgroundColor: COLORS.active }}
                title={`Active ${row.active}%`}
              />
              <div
                style={{ width: `${row.portfolio}%`, backgroundColor: COLORS.portfolio }}
                title={`Portfolio ${row.portfolio}%`}
              />
              <div
                style={{ width: `${row.passive}%`, backgroundColor: COLORS.passive }}
                title={`Passive ${row.passive}%`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-medium text-gray-900 dark:text-gray-100">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded shrink-0" style={{ backgroundColor: COLORS.active }} /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded shrink-0" style={{ backgroundColor: COLORS.portfolio }} /> Portfolio
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded shrink-0" style={{ backgroundColor: COLORS.passive }} /> Passive
        </span>
      </div>
    </div>
  );
}
