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
  { time: "0 h", hours: 0, stillWant: 100, label: "Moment of trigger" },
  { time: "30 min", hours: 0.5, stillWant: 85, label: "30 minutes" },
  { time: "24 h", hours: 24, stillWant: 45, label: "24 hours" },
  { time: "48 h", hours: 48, stillWant: 35, label: "48 hours" },
  { time: "1 week", hours: 168, stillWant: 22, label: "1 week" },
];

export function WaitingEffectChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% still want the item`, ""]}
            labelFormatter={(_, payload) => {
              const p = Array.isArray(payload) ? payload[0] : payload;
              return (p as { payload?: { label?: string } } | undefined)?.payload?.label ?? "";
            }}
          />
          <Line
            type="monotone"
            dataKey="stillWant"
            name="% who still want the item"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Desire drops sharply after 24–48 hours; after a week most impulse urges have faded
      </p>
    </div>
  );
}
