"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { option: "Without decoy", small: 68, medium: 0, large: 32 },
  { option: "With decoy", small: 32, medium: 8, large: 60 },
];

export function DecoyEffectChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="option" tick={{ fill: "#374151", fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% choose`, ""]}
          />
          <Legend />
          <Bar dataKey="small" name="Small (best value)" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
          <Bar dataKey="medium" name="Medium (decoy)" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
          <Bar dataKey="large" name="Large" stackId="a" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Adding a poorly-priced medium shifts choices from small to large — nothing about small or large changed
      </p>
    </div>
  );
}
