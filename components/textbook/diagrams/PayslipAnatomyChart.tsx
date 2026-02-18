"use client";

const SECTIONS = [
  { num: 1, title: "Personal information", desc: "Name, employee ID, tax code" },
  { num: 2, title: "Pay period & pay date", desc: "Dates covered, payment date" },
  { num: 3, title: "Earnings (gross pay)", desc: "Salary/wages, overtime, bonuses" },
  { num: 4, title: "Deductions", desc: "Tax, insurance, pension, etc." },
  { num: 5, title: "Net pay", desc: "Take-home — must match bank" },
  { num: 6, title: "Year-to-date totals", desc: "Cumulative gross, tax, net" },
];

export function PayslipAnatomyChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Six key sections to check on every payslip
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <div
            key={s.num}
            className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 dark:border-primary/40 dark:bg-primary/20"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {s.num}
            </span>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{s.title}</span>
              <p className="text-xs text-gray-600 dark:text-gray-300">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
