"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { stage: "€1k/mo\n(student)", income: 1000, wantsPct: 10, wantsLabel: "~10%" },
  { stage: "€2k/mo\n(entry)", income: 2000, wantsPct: 30, wantsLabel: "~30%" },
  { stage: "€4k/mo\n(mid-career)", income: 4000, wantsPct: 45, wantsLabel: "~45%" },
  { stage: "€8k/mo\n(senior)", income: 8000, wantsPct: 52, wantsLabel: "~52%" },
];

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];

export function WantEscalationChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="stage"
            tick={{ fill: "#374151", fontSize: 11 }}
            interval={0}
            textAnchor="middle"
            angle={0}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Wants as % of spending", angle: -90, position: "insideLeft", style: { fill: "#6b7280", fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% of spending on wants`, "Wants %"]}
            labelFormatter={(label) => label.replace(/\n/g, " ")}
          />
          <Bar dataKey="wantsPct" name="Wants %" radius={[4, 4, 0, 0]} label={{ position: "top", formatter: (v: number) => `~${v}%` }}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        As income rises, wants tend to expand — the foundation of lifestyle inflation
      </p>
    </div>
  );
}
