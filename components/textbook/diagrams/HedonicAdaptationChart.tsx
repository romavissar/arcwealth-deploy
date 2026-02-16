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
  { week: 0, material: 20, experience: 20 },
  { week: 1, material: 85, experience: 80 },
  { week: 2, material: 70, experience: 78 },
  { week: 4, material: 50, experience: 72 },
  { week: 8, material: 35, experience: 65 },
  { week: 12, material: 28, experience: 58 },
  { week: 16, material: 24, experience: 52 },
  { week: 20, material: 22, experience: 48 },
  { week: 24, material: 21, experience: 45 },
];

export function HedonicAdaptationChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="week"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `Week ${v}`}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% satisfaction`, ""]}
            labelFormatter={(v) => `Week ${v}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="material"
            name="Material purchase"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="experience"
            name="Experience"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Material goods lose their satisfaction boost fastest; experiences retain it longer
      </p>
    </div>
  );
}
