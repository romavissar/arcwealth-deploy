"use client";

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { frequency: "Monthly", paymentsPerYear: 12, amount: 2500, label: "€2,500 × 12" },
  { frequency: "Bi-weekly", paymentsPerYear: 26, amount: 1154, label: "€1,154 × 26" },
  { frequency: "Weekly", paymentsPerYear: 52, amount: 577, label: "€577 × 52" },
];

export function PayFrequencyChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Same €30,000/year — different cash flow by pay frequency
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="frequency" tick={{ fill: tickFill, fontSize: 12 }} />
          <YAxis
            domain={[0, 3000]}
            tick={{ fill: tickFill, fontSize: 11 }}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`€${value.toLocaleString()} per payment`, ""]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="amount" name="Amount per payment" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
        Bi-weekly = two &quot;bonus months&quot; per year with three paychecks
      </p>
    </div>
  );
}
