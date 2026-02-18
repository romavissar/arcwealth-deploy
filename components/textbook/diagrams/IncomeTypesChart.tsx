"use client";

const TYPES = [
  {
    name: "Active",
    desc: "Time for money — stops when you stop",
    examples: ["Salary", "Wages", "Freelance", "Commissions", "Tips", "Bonuses"],
    color: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950",
    descDark: "dark:text-blue-100",
  },
  {
    name: "Portfolio",
    desc: "Returns from financial assets",
    examples: ["Dividends", "Capital gains", "Interest", "Funds"],
    color: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950",
    descDark: "dark:text-emerald-100",
  },
  {
    name: "Passive",
    desc: "Initial effort, then ongoing with minimal work",
    examples: ["Rental income", "Royalties", "Digital products", "Affiliate"],
    color: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950",
    descDark: "dark:text-amber-100",
  },
];

export function IncomeTypesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        The three types of income — most people start with Active; wealth often includes all three
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TYPES.map((t) => (
          <div key={t.name} className={`rounded-lg border-2 p-4 ${t.color}`}>
            <div className="font-bold text-gray-900 dark:text-gray-100">{t.name}</div>
            <p className={`mt-1 text-xs text-gray-700 ${t.descDark}`}>{t.desc}</p>
            <ul className="mt-2 list-inside list-disc text-xs text-gray-800 dark:text-gray-200">
              {t.examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
