"use client";

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { reason: "Too vague", pct: 68 },
  { reason: "No deadline", pct: 62 },
  { reason: "Too ambitious", pct: 54 },
  { reason: "No tracking", pct: 51 },
  { reason: "Not tied to values", pct: 47 },
  { reason: "No milestones", pct: 44 },
  { reason: "No accountability", pct: 38 },
];

export function WhyGoalsFailChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Why financial goals fail — ranked by frequency (preventable with proper setup)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="reason"
            tick={{ fill: tickFill, fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis domain={[0, 80]} tick={{ fill: tickFill, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% of failed goals`, ""]}
          />
          <Bar dataKey="pct" name="% of failures" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
