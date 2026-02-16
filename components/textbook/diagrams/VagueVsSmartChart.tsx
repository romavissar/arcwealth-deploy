"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { type: "Vague goals", rate: 12, fill: "#94a3b8" },
  { type: "Fully SMART goals", rate: 76, fill: "#059669" },
];

export function VagueVsSmartChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="type" tick={{ fill: "#374151", fontSize: 12 }} width={95} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% achievement rate`, ""]}
            labelFormatter={() => ""}
          />
          <Bar dataKey="rate" name="Achievement rate" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        SMART goals are over 6× more likely to succeed than vague intentions
      </p>
    </div>
  );
}
