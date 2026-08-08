"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";

const PRESETS = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "ano", label: "Este ano" },
  { value: "personalizado", label: "Personalizado" },
];

export function PeriodFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodo = searchParams.get("periodo") ?? "mes";
  const inicio = searchParams.get("inicio") ?? "";
  const fim = searchParams.get("fim") ?? "";

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div>
        <Label>Período</Label>
        <Select
          className="w-48"
          value={periodo}
          onChange={(e) => {
            const novoPeriodo = e.target.value;
            updateParams({ periodo: novoPeriodo, ...(novoPeriodo !== "personalizado" ? { inicio: null, fim: null } : {}) });
          }}
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>
      {periodo === "personalizado" && (
        <>
          <div>
            <Label>De</Label>
            <Input type="date" value={inicio} onChange={(e) => updateParams({ inicio: e.target.value })} />
          </div>
          <div>
            <Label>Até</Label>
            <Input type="date" value={fim} onChange={(e) => updateParams({ fim: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}
