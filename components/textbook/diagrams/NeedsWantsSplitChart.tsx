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
  { category: "Food", need: 70, want: 30 },
  { category: "Shelter", need: 85, want: 15 },
  { category: "Transport", need: 60, want: 40 },
  { category: "Clothing", need: 50, want: 50 },
  { category: "Healthcare", need: 90, want: 10 },
  { category: "Entertainment", need: 20, want: 80 },
];

const NEED_COLOR = "#4F46E5";
const WANT_COLOR = "#F59E0B";

export function NeedsWantsSplitChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="category" dataKey="category" width={70} tick={{ fill: "#374151", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}%`, ""]}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Bar name="Need" dataKey="need" stackId="a" fill={NEED_COLOR} radius={[0, 4, 4, 0]} />
          <Bar name="Want" dataKey="want" stackId="a" fill={WANT_COLOR} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Illustrative split — percentages vary by individual and circumstance
      </p>
    </div>
  );
}
