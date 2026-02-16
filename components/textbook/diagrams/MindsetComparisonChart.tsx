"use client";

const DIMENSIONS = [
  { dim: "Time horizon", scarcity: "Short-term survival", abundance: "Long-term planning" },
  { dim: "Risk", scarcity: "Avoid all risk", abundance: "Calculated risks" },
  { dim: "Opportunities", scarcity: "Focus on what could go wrong", abundance: "Focus on possibility" },
  { dim: "Others' success", scarcity: "Threatened, jealous", abundance: "Learn from them" },
  { dim: "Income", scarcity: "Accept low pay; don't negotiate", abundance: "Seek raises, value" },
  { dim: "Spending", scarcity: "Hoard or splurge", abundance: "Strategic balance" },
  { dim: "Setbacks", scarcity: "I'm a failure", abundance: "What can I learn?" },
  { dim: "Generosity", scarcity: "Can't afford to give", abundance: "Strategic giving" },
  { dim: "Learning", scarcity: "Can't afford to invest", abundance: "ROI on skills" },
];

export function MindsetComparisonChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="py-2 pr-4 text-left font-semibold text-gray-900 dark:text-gray-100">Dimension</th>
              <th className="py-2 px-4 text-left font-semibold text-rose-700 dark:text-rose-400">Scarcity</th>
              <th className="py-2 pl-4 text-left font-semibold text-emerald-700 dark:text-emerald-400">Abundance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {DIMENSIONS.map((row) => (
              <tr key={row.dim}>
                <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{row.dim}</td>
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{row.scarcity}</td>
                <td className="py-2 pl-4 text-gray-700 dark:text-gray-300">{row.abundance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
        Same circumstances — different mindset drives different behaviour and outcomes
      </p>
    </div>
  );
}
