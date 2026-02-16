"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { strategy: "Automate savings", effectiveness: 95 },
  { strategy: "Make future concrete", effectiveness: 88 },
  { strategy: "Commitment devices", effectiveness: 82 },
  { strategy: "Change environment", effectiveness: 78 },
  { strategy: "Start with small wins", effectiveness: 72 },
  { strategy: "Track progress visually", effectiveness: 68 },
  { strategy: "Reward milestones", effectiveness: 62 },
  { strategy: "Accountability partner", effectiveness: 58 },
];

export function StrategiesEffectivenessChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="category" dataKey="strategy" width={135} tick={{ fill: "#374151", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% reported effectiveness`, ""]}
          />
          <Bar dataKey="effectiveness" name="Effectiveness" fill="#4F46E5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Structural strategies (automation, commitment) rank highest — illustrative rankings
      </p>
    </div>
  );
}
