"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { measure: "Immediate relief (0–10)", retail: 8.2, healthy: 6.8 },
  { measure: "Duration (hours)", retail: 0.5, healthy: 4 },
  { measure: "Long-term effectiveness (0–10)", retail: 2.1, healthy: 8.3 },
];

export function CopingComparisonChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="measure"
            tick={{ fill: "#374151", fontSize: 10 }}
            angle={-18}
            textAnchor="end"
            height={75}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string, props: { payload: { measure?: string } }) => {
              const m = props.payload?.measure ?? "";
              const suffix = m.includes("Duration") ? "h" : m.includes("relief") || m.includes("effectiveness") ? "/10" : "";
              return [`${value}${suffix}`, name === "retail" ? "Retail therapy" : "Healthier coping"];
            }}
          />
          <Legend />
          <Bar name="Retail therapy" dataKey="retail" fill="#DC2626" radius={[4, 4, 0, 0]} />
          <Bar name="Healthier coping" dataKey="healthy" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Retail therapy: fast relief (30 min), €45/use. Healthier coping: longer relief (4+ hrs), €0.
      </p>
    </div>
  );
}
