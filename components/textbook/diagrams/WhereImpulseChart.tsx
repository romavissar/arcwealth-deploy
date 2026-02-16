"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { channel: "Online shopping", share: 38, fill: "#4F46E5" },
  { channel: "Supermarket", share: 28, fill: "#6366F1" },
  { channel: "Social media", share: 18, fill: "#818CF8" },
  { channel: "In-store retail", share: 10, fill: "#A5B4FC" },
  { channel: "Other", share: 6, fill: "#C7D2FE" },
];

export function WhereImpulseChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" domain={[0, 50]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="category" dataKey="channel" width={95} tick={{ fill: "#374151", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            formatter={(value: number) => [`${value}% of impulse purchases`, "Share"]}
          />
          <Bar dataKey="share" name="Share" fill="#4F46E5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Share of reported impulse purchases by channel — illustrative, based on consumer research
      </p>
    </div>
  );
}
