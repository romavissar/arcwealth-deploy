"use client";

const STRATEGIES = [
  { name: "Ask for a raise", effort: "Low", timeline: "1 month", impact: "€1.5k–5k" },
  { name: "Negotiate job offer", effort: "Low", timeline: "Immediate", impact: "€2k–8k" },
  { name: "Change jobs", effort: "Moderate", timeline: "3–6 mo", impact: "€3k–15k+" },
  { name: "Add freelance work", effort: "Moderate", timeline: "3–4 mo", impact: "€3k–20k" },
  { name: "Sell skill online", effort: "High", timeline: "6–12 mo", impact: "€2k–30k" },
  { name: "Get certification", effort: "Mod–High", timeline: "6–12 mo", impact: "€2k–10k" },
  { name: "Invest (ETFs)", effort: "Low", timeline: "3–10 yr", impact: "Compound" },
  { name: "Side business", effort: "Very high", timeline: "12–24 mo", impact: "Variable" },
  { name: "Build passive asset", effort: "Very high", timeline: "12–36 mo", impact: "Variable" },
  { name: "Upskill / degree", effort: "Very high", timeline: "2–4 yr", impact: "€5k–30k+" },
];

export function IncomeStrategiesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Income growth strategies — effort, timeline, and estimated annual impact
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-2 font-medium text-gray-900 dark:text-gray-100">Strategy</th>
              <th className="pb-2 font-medium text-gray-900 dark:text-gray-100">Effort</th>
              <th className="pb-2 font-medium text-gray-900 dark:text-gray-100">Timeline</th>
              <th className="pb-2 font-medium text-gray-900 dark:text-gray-100">Est. impact</th>
            </tr>
          </thead>
          <tbody>
            {STRATEGIES.map((s) => (
              <tr key={s.name} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                <td className="py-2 text-gray-700 dark:text-gray-300">{s.effort}</td>
                <td className="py-2 text-gray-700 dark:text-gray-300">{s.timeline}</td>
                <td className="py-2 text-gray-700 dark:text-gray-300">{s.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-xs text-gray-700 dark:text-gray-300">
        Fastest leverage for most: ask for a raise or negotiate job offer first
      </p>
    </div>
  );
}
