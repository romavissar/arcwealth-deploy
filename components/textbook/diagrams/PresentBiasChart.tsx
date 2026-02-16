"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "Today", delay: "Now", value: 100 },
  { time: "1 week", delay: "1 week", value: 85 },
  { time: "1 month", delay: "1 month", value: 62 },
  { time: "3 months", delay: "3 months", value: 48 },
  { time: "1 year", delay: "1 year", value: 38 },
  { time: "2 years", delay: "2 years", value: 32 },
];

export function PresentBiasChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis
            domain={[0, 110]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`Feels worth €${value}`, "Perceived value"]}
            labelFormatter={(_, payload) => {
              const p = Array.isArray(payload) ? payload[0] : payload;
              return (p as { payload?: { delay?: string } } | undefined)?.payload?.delay ?? "";
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Perceived value of €100"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Same €100 — perceived value drops the further in the future it is (hyperbolic discounting)
      </p>
    </div>
  );
}
