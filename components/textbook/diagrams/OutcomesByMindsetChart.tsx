"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { measure: "Savings rate (%)", scarcity: 3.2, abundance: 14.8 },
  { measure: "Financial stress (1–10)", scarcity: 8.1, abundance: 4.2 },
  { measure: "Income growth 5y (%)", scarcity: 8, abundance: 28 },
  { measure: "Satisfaction (1–10)", scarcity: 3.5, abundance: 7.8 },
];

export function OutcomesByMindsetChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="measure"
            tick={{ fill: "#374151", fontSize: 10 }}
            angle={-22}
            textAnchor="end"
            height={75}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string) => [
              name === "scarcity" ? value : value,
              name === "scarcity" ? "Scarcity" : "Abundance",
            ]}
          />
          <Legend />
          <Bar name="Scarcity mindset" dataKey="scarcity" fill="#DC2626" radius={[4, 4, 0, 0]} />
          <Bar name="Abundance mindset" dataKey="abundance" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Similar incomes, different mindsets — illustrative, based on financial psychology research
      </p>
    </div>
  );
}
