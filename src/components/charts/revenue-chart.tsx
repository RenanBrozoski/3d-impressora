"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { mes: string; faturamento: number; lucro: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))}
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="faturamento" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="lucro" name="Lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
