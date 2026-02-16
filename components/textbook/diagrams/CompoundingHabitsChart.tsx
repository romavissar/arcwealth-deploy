"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 1.01^days: 1 year ≈ 37.78×, 30 years ≈ 37^30 (huge). Cap display at 40×.
const data = Array.from({ length: 31 }, (_, i) => {
  const years = i;
  const days = years * 365;
  const improve = days <= 0 ? 1 : Math.pow(1.01, days);
  const decline = days <= 0 ? 1 : Math.pow(0.99, days);
  return {
    years,
    improvement: Math.min(improve, 40),
    decline: Math.max(decline, 0.01),
  };
});

export function CompoundingHabitsChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="years"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}y`}
          />
          <YAxis
            type="number"
            domain={[0, 42]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => (v >= 1 ? `${v}×` : v)}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number, name: string) => [
              name === "improvement" ? `${value.toFixed(1)}×` : value.toFixed(2),
              name === "improvement" ? "1% daily improvement" : "1% daily decline",
            ]}
            labelFormatter={(v) => `Year ${v}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="improvement"
            name="1% daily improvement"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="decline"
            name="1% daily decline"
            stroke="#DC2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Small daily improvements compound to ~37× over 30 years; small declines → near zero
      </p>
    </div>
  );
}
