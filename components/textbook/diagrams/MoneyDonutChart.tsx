"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Digital (bank deposits, electronic)", value: 92, color: "#4F46E5" },
  { name: "Physical (cash, coins)", value: 8, color: "#94a3b8" },
];

export function MoneyDonutChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${value}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}%`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: "13px" }}
            formatter={(value, entry) => (
              <span className="text-gray-700">
                {value} ({(entry.payload as { value: number }).value}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Typical developed economy — most money is digital
      </p>
    </div>
  );
}
