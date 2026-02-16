"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

const data = [
  { name: "Online gambling", dopamine: 95, unplanned: 92, size: 80 },
  { name: "Social media", dopamine: 88, unplanned: 75, size: 120 },
  { name: "Gaming / loot boxes", dopamine: 85, unplanned: 70, size: 100 },
  { name: "Fast fashion", dopamine: 72, unplanned: 68, size: 70 },
  { name: "Flash sales", dopamine: 78, unplanned: 82, size: 60 },
  { name: "Streaming", dopamine: 55, unplanned: 45, size: 90 },
  { name: "Dating apps", dopamine: 82, unplanned: 50, size: 50 },
];

export function DopamineIndustriesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="dopamine"
            name="Dopamine / habit strength"
            domain={[40, 100]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            label={{ value: "Dopamine strength", position: "bottom", offset: 0, style: { fill: "#6b7280", fontSize: 11 } }}
          />
          <YAxis
            type="number"
            dataKey="unplanned"
            name="Unplanned spend risk"
            domain={[30, 100]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            label={{ value: "Unplanned spend", angle: -90, position: "insideLeft", style: { fill: "#6b7280", fontSize: 11 } }}
          />
          <ZAxis type="number" dataKey="size" range={[200, 800]} name="Revenue (relative)" />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { name: string; dopamine: number; unplanned: number };
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-gray-600">Dopamine strength: {p.dopamine}</p>
                  <p className="text-gray-600">Unplanned spend risk: {p.unplanned}</p>
                </div>
              );
            }}
          />
          <Scatter name="Industries" data={data} fill="#4F46E5" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Positioning by dopamine/habit strength and unplanned spend — bubble size ≈ revenue (illustrative)
      </p>
    </div>
  );
}
