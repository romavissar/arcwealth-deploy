"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { outcome: "University completion", low: 42, high: 78, unit: "%" },
  { outcome: "Income (age 30, €k)", low: 32, high: 48, unit: "k" },
  { outcome: "Credit score", low: 610, high: 720, unit: "" },
  { outcome: "Savings rate", low: 3.2, high: 12.8, unit: "%" },
  { outcome: "Life satisfaction (1–10)", low: 6.1, high: 7.4, unit: "/10" },
];

export function MarshmallowOutcomesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="outcome"
            tick={{ fill: "#374151", fontSize: 11 }}
            angle={-22}
            textAnchor="end"
            height={72}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string, props: { payload: { unit: string } }) => {
              const u = props.payload.unit;
              return [u === "k" ? `€${value}k` : u === "/10" ? value : `${value}${u}`, name];
            }}
          />
          <Legend />
          <Bar name="Low delayers (ate immediately)" dataKey="low" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          <Bar name="High delayers (waited)" dataKey="high" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Life outcomes 30+ years later — illustrative, based on Mischel et al. longitudinal research
      </p>
    </div>
  );
}
