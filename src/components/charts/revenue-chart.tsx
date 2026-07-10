"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { mes: string; faturamento: number; lucro: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-white/10" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--muted)" }} stroke="var(--surface-border)" />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted)" }} stroke="var(--surface-border)" />
        <Tooltip
          cursor={{ fill: "var(--accent)", opacity: 0.08 }}
          formatter={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))}
          contentStyle={{
            borderRadius: 8,
            fontSize: 13,
            background: "var(--surface-solid)",
            border: "1px solid var(--surface-border)",
            color: "var(--foreground)",
          }}
          labelStyle={{ color: "var(--foreground)" }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: "var(--foreground)" }} />
        <Bar dataKey="faturamento" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="lucro" name="Lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
