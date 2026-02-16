"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { metric: "Ease of trade", barter: 2, money: 9 },
  { metric: "Ability to save value", barter: 2, money: 9 },
];

export function BarterVsMoneyChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="metric" tick={{ fill: "#374151", fontSize: 12 }} />
          <YAxis domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}/10`, ""]}
          />
          <Legend />
          <Bar name="Barter" dataKey="barter" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          <Bar name="Money" dataKey="money" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Illustrative scale — money scores higher on both
      </p>
    </div>
  );
}
