"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function futureValue(monthly: number, months: number, annualRate = 0.06): number {
  if (monthly <= 0) return 0;
  const r = annualRate / 12;
  const n = months;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
}

const years = [0, 5, 10, 15, 20, 25, 30, 35, 40];
const data = years.map((y) => ({
  year: y,
  instant: futureValue(100, y * 12),
  delayed: futureValue(300, y * 12),
}));

export function CostInstantGratificationChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}y`}
          />
          <YAxis
            tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`€${value.toLocaleString()}`, ""]}
            labelFormatter={(v) => `Year ${v}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="instant"
            name="Instant gratification (€100/mo saved)"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="delayed"
            name="Delayed gratification (€300/mo saved)"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Same income, €200/month difference. Assumes 6% annual growth over 40 years.
      </p>
    </div>
  );
}
