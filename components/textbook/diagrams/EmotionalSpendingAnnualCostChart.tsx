"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { category: "Stress relief", cost: 2220 },
  { category: "Social pressure", cost: 1872 },
  { category: "Boredom browsing", cost: 1704 },
  { category: "Celebration", cost: 1536 },
  { category: "Sadness comfort", cost: 1164 },
];

const TOTAL = data.reduce((s, d) => s + d.cost, 0);

export function EmotionalSpendingAnnualCostChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 5, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="category"
            tick={{ fill: "#374151", fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            height={70}
          />
          <YAxis
            tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`€${value.toLocaleString()}/year`, ""]}
          />
          <Bar dataKey="cost" name="Annual cost" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm font-medium text-gray-700">
        Combined total: €{TOTAL.toLocaleString()}/year
      </p>
      <p className="text-center text-sm text-gray-500">
        Moderate emotional spending across categories — based on consumer research
      </p>
    </div>
  );
}
