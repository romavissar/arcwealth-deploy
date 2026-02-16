"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { scenario: "Low anchor (€25 → €20)", discount: 20, perception: 35, label: "“Decent”" },
  { scenario: "High anchor (€89 → €20)", discount: 77, perception: 88, label: "“Amazing deal!”" },
];

export function AnchoringEffectChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="scenario"
            tick={{ fill: "#374151", fontSize: 11 }}
            angle={-12}
            textAnchor="end"
            height={70}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string) => [`${value}%`, name === "discount" ? "Discount shown" : "Perceived deal strength"]}
          />
          <Bar dataKey="discount" name="Discount %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="perception" name="Perceived deal strength" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Same €20 t-shirt — the anchor changes how good the deal feels
      </p>
    </div>
  );
}
