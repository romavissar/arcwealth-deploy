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
  { stage: "Browse", dopamine: 25, expected: 40 },
  { stage: "Add to cart", dopamine: 55, expected: 65 },
  { stage: "Checkout", dopamine: 95, expected: 90 },
  { stage: "Receive", dopamine: 50, expected: 85 },
  { stage: "1 week later", dopamine: 20, expected: 80 },
];

export function DopamineCurveChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="stage" tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}%`, ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="dopamine"
            name="Dopamine (actual)"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expected"
            name="Expected satisfaction"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Dopamine peaks at checkout; the gap between expectation and reality drives the next purchase
      </p>
    </div>
  );
}
