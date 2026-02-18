"use client";

const DIMENSIONS = [
  { dim: "Payment structure", salary: "Fixed annual amount", wage: "Per hour worked" },
  { dim: "Frequency", salary: "Monthly or bi-weekly (equal)", wage: "Weekly or bi-weekly (varies)" },
  { dim: "Hours worked", salary: "Not tracked; paid same", wage: "Tracked; pay = hours × rate" },
  { dim: "Overtime", salary: "Typically none", wage: "1.5×, 2×, or more" },
  { dim: "Stability", salary: "Very high", wage: "Variable" },
  { dim: "Typical roles", salary: "Professional, office", wage: "Hourly, shift-based" },
];

export function SalaryVsWageChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Salary vs wage — six key differences
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-2 pr-2 font-medium text-gray-900 dark:text-gray-100">Dimension</th>
              <th className="pb-2 px-2 font-medium text-blue-700 dark:text-blue-400">Salary</th>
              <th className="pb-2 pl-2 font-medium text-emerald-700 dark:text-emerald-400">Wage</th>
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((row) => (
              <tr key={row.dim} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 pr-2 font-medium text-gray-900 dark:text-gray-100">{row.dim}</td>
                <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{row.salary}</td>
                <td className="py-2 pl-2 text-gray-700 dark:text-gray-300">{row.wage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
