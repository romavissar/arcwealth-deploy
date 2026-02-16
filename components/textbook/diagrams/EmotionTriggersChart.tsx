"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { emotion: "Stress / anxiety", pct: 72 },
  { emotion: "Boredom", pct: 68 },
  { emotion: "Sadness", pct: 61 },
  { emotion: "Loneliness", pct: 54 },
  { emotion: "Excitement", pct: 52 },
];

export function EmotionTriggersChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 80]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="category" dataKey="emotion" width={95} tick={{ fill: "#374151", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% report as trigger`, ""]}
          />
          <Bar dataKey="pct" name="% who report" fill="#DC2626" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Multiple selections allowed — based on consumer behaviour surveys
      </p>
    </div>
  );
}
