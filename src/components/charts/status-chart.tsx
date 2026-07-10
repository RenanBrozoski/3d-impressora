"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ORDER_STATUS_LABEL } from "@/lib/status";

const COLORS = ["#eab308", "#3b82f6", "#a3a3a3", "#a855f7", "#f97316", "#22c55e", "#16a34a", "#ef4444"];

export function StatusChart({ data }: { data: { status: string; quantidade: number }[] }) {
  const chartData = data.map((d) => ({ name: ORDER_STATUS_LABEL[d.status] ?? d.status, value: d.quantidade }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
