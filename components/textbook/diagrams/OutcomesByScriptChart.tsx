"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { script: "Avoidance", savings: 2.1, debt: 4200, stress: 6.8, satisfaction: 4.2 },
  { script: "Worship", savings: 4.5, debt: 5200, stress: 6.5, satisfaction: 4.8 },
  { script: "Vigilance", savings: 18.3, debt: 800, stress: 6.2, satisfaction: 5.8 },
  { script: "Status", savings: 3.4, debt: 8200, stress: 7.2, satisfaction: 4.7 },
];

export function OutcomesByScriptChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="script" tick={{ fill: "#374151", fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Savings rate %", angle: -90, position: "insideLeft", style: { fill: "#6b7280", fontSize: 10 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `€${v}`}
            label={{ value: "CC debt", angle: 90, position: "insideRight", style: { fill: "#6b7280", fontSize: 10 } }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string) => {
              if (name === "savings") return [`${value}%`, "Savings rate"];
              if (name === "debt") return [`€${value}`, "Credit card debt"];
              if (name === "stress") return [`${value}/10`, "Financial stress"];
              if (name === "satisfaction") return [`${value}/10`, "Satisfaction"];
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="savings" name="Savings rate %" fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="debt" name="Credit card debt (€)" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Financial outcomes by dominant money script — illustrative, based on Klontz et al.
      </p>
    </div>
  );
}
