"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { habit: "Daily coffee (€3.50/day)", cost: 1278 },
  { habit: "Weekly takeaway (€18/wk)", cost: 936 },
  { habit: "Impulse snacks (€2/day)", cost: 730 },
  { habit: "Monthly clothes (€40/mo)", cost: 480 },
  { habit: "In-app purchases (€8/wk)", cost: 416 },
  { habit: "Unplanned online (€25/mo)", cost: 300 },
];

const TOTAL = data.reduce((s, d) => s + d.cost, 0);

export function AnnualCostChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="habit"
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
            formatter={(value: number) => [`€${value.toLocaleString()}/year`, "Annual cost"]}
          />
          <Bar dataKey="cost" name="Annual cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm font-medium text-gray-700">
        Combined total: €{TOTAL.toLocaleString()}/year
      </p>
      <p className="text-center text-sm text-gray-500">
        Small habits that barely register day-to-day add up quickly
      </p>
    </div>
  );
}
