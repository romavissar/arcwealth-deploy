"use client";

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { scenario: "Salary €31,200\n(52 weeks paid)", amount: 31200 },
  { scenario: "Wage 40h/wk × 52", amount: 31200 },
  { scenario: "Wage 40h/wk × 48\n(4 wk unpaid)", amount: 28800 },
  { scenario: "Wage 35h/wk × 52", amount: 27300 },
];

export function AnnualComparisonChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Annual earnings — salary (fixed) vs wage at €15/hour (depends on weeks/hours worked)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 35000]} tick={{ fill: tickFill, fontSize: 11 }} tickFormatter={(v) => `€${v / 1000}k`} />
          <YAxis type="category" dataKey="scenario" tick={{ fill: tickFill, fontSize: 10 }} width={115} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`€${value.toLocaleString()} annual`, ""]}
            labelFormatter={(label) => label?.replace(/\n/g, " ")}
          />
          <Legend wrapperStyle={{ color: tickFill }} />
          <Bar dataKey="amount" name="Annual earnings" fill="#059669" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
        Salary includes paid time off; wage total drops with unpaid leave
      </p>
    </div>
  );
}
