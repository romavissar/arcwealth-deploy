"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { strategy: "Track wins & progress", effectiveness: 92 },
  { strategy: "Celebrate others' success", effectiveness: 88 },
  { strategy: "Invest in skills", effectiveness: 86 },
  { strategy: "Daily gratitude", effectiveness: 85 },
  { strategy: "Reframe setbacks as learning", effectiveness: 82 },
  { strategy: "Give deliberately", effectiveness: 78 },
  { strategy: "Challenge scarcity thoughts", effectiveness: 74 },
  { strategy: "Expose to abundance examples", effectiveness: 68 },
];

export function BuildingAbundanceChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 155, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="category" dataKey="strategy" width={150} tick={{ fill: "#374151", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% reported effectiveness`, ""]}
          />
          <Bar dataKey="effectiveness" name="Effectiveness" fill="#059669" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Evidence-based strategies — change takes 6–12 weeks of consistent practice
      </p>
    </div>
  );
}
