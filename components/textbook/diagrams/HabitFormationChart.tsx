"use client";

import { useTheme } from "next-themes";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Effort: Week 1 ~65%, Week 3 ~85% (The Dip), Week 6 ~55%, Week 9-10 ~30%, Day 66-90 ~20%
const data = [
  { week: 1, effort: 65, phase: "Honeymoon" },
  { week: 2, effort: 78, phase: "" },
  { week: 3, effort: 85, phase: "The Dip" },
  { week: 4, effort: 80, phase: "" },
  { week: 5, effort: 62, phase: "" },
  { week: 6, effort: 55, phase: "Breakthrough" },
  { week: 8, effort: 42, phase: "" },
  { week: 10, effort: 30, phase: "Automatic" },
  { week: 12, effort: 20, phase: "Ingrained" },
];

export function HabitFormationChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickFill = isDark ? "#d1d5db" : "#374151";
  const gridStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        Habit formation: U-shaped effort curve — most quit in Week 3 (The Dip)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="week" tick={{ fill: tickFill, fontSize: 11 }} tickFormatter={(v) => `Wk ${v}`} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: tickFill, fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% effort`, ""]}
            labelFormatter={(week) => {
              const point = data.find((d) => d.week === week);
              return point?.phase ? `Week ${week} — ${point.phase}` : `Week ${week}`;
            }}
          />
          <ReferenceLine x={3} stroke="#DC2626" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="effort" name="Effort required" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-600 dark:text-gray-400">
        Push through Week 3; by Week 6 it gets easier. By Week 9–10 habit feels automatic.
      </p>
    </div>
  );
}
