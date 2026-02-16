"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

const properties = [
  { property: "Durability", fiat: 8, barter: 3, fullMark: 10 },
  { property: "Divisibility", fiat: 9, barter: 2, fullMark: 10 },
  { property: "Portability", fiat: 9, barter: 2, fullMark: 10 },
  { property: "Uniformity", fiat: 10, barter: 2, fullMark: 10 },
  { property: "Limited Supply", fiat: 7, barter: 4, fullMark: 10 },
  { property: "Acceptability", fiat: 9, barter: 3, fullMark: 10 },
];

export function PropertiesRadarChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={340}>
        <RechartsRadar data={properties}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="property"
            tick={{ fill: "#374151", fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <Radar
            name="Fiat currency"
            dataKey="fiat"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Barter / commodity"
            dataKey="barter"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: "14px" }}
            formatter={(value) => <span className="text-gray-700">{value}</span>}
          />
        </RechartsRadar>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm text-gray-500">
        Illustrative comparison (out of 10)
      </p>
    </div>
  );
}
