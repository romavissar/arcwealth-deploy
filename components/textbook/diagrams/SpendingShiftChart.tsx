"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { category: "Aligned with values", typical: 18, valuesBased: 52 },
  { category: "Misaligned", typical: 60, valuesBased: 20 },
  { category: "Neutral", typical: 22, valuesBased: 28 },
];

export function SpendingShiftChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="category"
            tick={{ fill: "#374151", fontSize: 11 }}
          />
          <YAxis
            domain={[0, 70]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% of spending`, ""]}
          />
          <Legend />
          <Bar name="Typical spending" dataKey="typical" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar name="Values-based spending" dataKey="valuesBased" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Same income — values-based budgeting nearly triples spending on aligned priorities
      </p>
    </div>
  );
}
