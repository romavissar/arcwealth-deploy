"use client";

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { error: "Wrong tax code", pct: 24 },
  { error: "Missing overtime", pct: 18 },
  { error: "Hours mismatch", pct: 15 },
  { error: "Wrong rate/salary", pct: 12 },
  { error: "Missing bonus/holiday", pct: 11 },
  { error: "Wrong pension %", pct: 8 },
  { error: "Bank details wrong", pct: 3 },
];

export function CommonPayslipErrorsChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Seven most common payslip errors — % of employees who experience them
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 30]} tick={{ fill: tickFill, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="error" tick={{ fill: tickFill, fontSize: 11 }} width={115} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% experience this`, ""]}
          />
          <Bar dataKey="pct" name="% of employees" fill="#DC2626" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
        15–30% of employees have at least one payroll error per year — check every month
      </p>
    </div>
  );
}
