"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "Session 1", fixed: 85, variable: 90 },
  { time: "Session 2", fixed: 78, variable: 95 },
  { time: "Session 3", fixed: 72, variable: 70 },
  { time: "Session 4", fixed: 65, variable: 88 },
  { time: "Session 5", fixed: 58, variable: 75 },
  { time: "Session 6", fixed: 52, variable: 92 },
  { time: "Session 7", fixed: 48, variable: 68 },
  { time: "Session 8", fixed: 45, variable: 85 },
];

export function RewardSchedulesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% engagement`, ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="fixed"
            name="Fixed reward (predictable)"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="variable"
            name="Variable reward (unpredictable)"
            stroke="#DC2626"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Variable rewards produce persistently elevated, erratic engagement — far more addictive
      </p>
    </div>
  );
}
