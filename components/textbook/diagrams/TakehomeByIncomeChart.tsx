"use client";

import { useTheme } from "next-themes";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { gross: 20, netPct: 82, net: 16.4 },
  { gross: 30, netPct: 78, net: 23.4 },
  { gross: 40, netPct: 74, net: 29.6 },
  { gross: 50, netPct: 71, net: 35.5 },
  { gross: 60, netPct: 68, net: 40.8 },
  { gross: 80, netPct: 64, net: 51.2 },
  { gross: 100, netPct: 61, net: 61 },
];

export function TakehomeByIncomeChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Take-home percentage falls as gross rises (progressive taxation) — illustrative
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="gross"
            tick={{ fill: tickFill, fontSize: 11 }}
            tickFormatter={(v) => `€${v}k`}
          />
          <YAxis
            domain={[55, 90]}
            tick={{ fill: tickFill, fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% take-home`, ""]}
            labelFormatter={(gross) => `€${gross}k gross`}
          />
          <Line
            type="monotone"
            dataKey="netPct"
            name="Take-home %"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
        Low earners keep ~80–85%; high earners ~55–65%. Doubling gross does not double net.
      </p>
    </div>
  );
}
