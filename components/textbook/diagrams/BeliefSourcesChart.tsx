"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Parents & family", value: 42, color: "#4F46E5" },
  { name: "Childhood experiences", value: 23, color: "#6366F1" },
  { name: "Peer group", value: 14, color: "#818CF8" },
  { name: "Media & culture", value: 11, color: "#A5B4FC" },
  { name: "Other", value: 10, color: "#C7D2FE" },
];

function renderLabel({ name, value, cx, cy, midAngle, innerRadius, outerRadius }: {
  name: string;
  value: number;
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
}) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x >= cx ? "start" : "end"}
      dominantBaseline="central"
      className="fill-gray-700 dark:fill-gray-300"
      style={{ fontSize: 10 }}
    >
      {name} {value}%
    </text>
  );
}

export function BeliefSourcesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 16, right: 12, bottom: 24, left: 12 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={48}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
            formatter={(value: number) => [`${value}%`, ""]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "11px" }}
            iconSize={10}
            formatter={(value) => <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: "11px" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
        Sources of money beliefs — family and early experiences account for most influence
      </p>
    </div>
  );
}
