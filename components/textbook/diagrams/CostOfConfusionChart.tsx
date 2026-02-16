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
  ReferenceLine,
} from "recharts";

// 6% annual growth, monthly savings: FV = PMT * (((1+r)^n - 1) / r), r = 0.06/12, n = months
function futureValue(monthly: number, months: number, annualRate = 0.06): number {
  if (monthly <= 0) return 0;
  const r = annualRate / 12;
  const n = months;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
}

const months = Array.from({ length: 11 }, (_, i) => i * 12); // 0, 12, 24, ... 120
const data = months.map((m) => ({
  year: m / 12,
  label: m === 0 ? "Start" : `Year ${m / 12}`,
  personA: futureValue(200, m),
  personB: futureValue(50, m),
  personC: 0,
}));

export function CostOfConfusionChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => (v === 0 ? "0" : `Yr ${v}`)}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`€${value.toLocaleString()}`, ""]}
            labelFormatter={(_, payload) => {
              const p = Array.isArray(payload) ? payload[0] : payload;
              return (p as { payload?: { label?: string } } | undefined)?.payload?.label ?? "";
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="personA"
            name="Person A — €200/mo (clear needs vs wants)"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="personB"
            name="Person B — €50/mo (fuzzy on distinction)"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="personC"
            name="Person C — €0 (treats wants as needs)"
            stroke="#DC2626"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <ReferenceLine x={10} stroke="#94a3b8" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Same income, different habits. Assumes 6% annual growth over 10 years.
      </p>
    </div>
  );
}
