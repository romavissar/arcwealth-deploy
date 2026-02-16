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
  { time: "Day 0", aligned: 75, misaligned: 80 },
  { time: "Day 3", aligned: 72, misaligned: 55 },
  { time: "Week 1", aligned: 70, misaligned: 35 },
  { time: "Week 2", aligned: 68, misaligned: 25 },
  { time: "Month 1", aligned: 65, misaligned: 18 },
  { time: "Month 3", aligned: 62, misaligned: 15 },
];

export function SatisfactionComparisonChart() {
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
            formatter={(value: number) => [`${value}% satisfaction`, ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="aligned"
            name="Values-aligned purchase"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="misaligned"
            name="Misaligned purchase"
            stroke="#DC2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Aligned spending holds satisfaction; misaligned loses appeal within days
      </p>
    </div>
  );
}
