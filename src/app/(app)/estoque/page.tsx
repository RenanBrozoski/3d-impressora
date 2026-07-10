import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { NovoItemButton } from "./novo-item-button";
import { ItemRowActions } from "./item-row-actions";

const TIPO_LABEL: Record<string, string> = {
  FILAMENTO: "Filamento",
  RESINA: "Resina",
  EMBALAGEM: "Embalagem",
  PECA: "Peça",
  FERRAMENTA: "Ferramenta",
  OUTRO: "Outro",
};

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}) {
  const { q, tipo } = await searchParams;

  const items = await db.inventoryItem.findMany({
    where: {
      AND: [q ? { nome: { contains: q } } : {}, tipo ? { tipo: tipo as never } : {}],
    },
    orderBy: { nome: "asc" },
  });

  const estoqueBaixo = items.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Estoque</h1>
        <NovoItemButton />
      </div>

      {estoqueBaixo.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            <strong>{estoqueBaixo.length}</strong> item(ns) com estoque baixo: {estoqueBaixo.map((i) => i.nome).join(", ")}
          </p>
        </div>
      )}

      <form className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" method="get">
        <Input name="q" placeholder="Buscar por nome..." defaultValue={q ?? ""} />
        <Select name="tipo" defaultValue={tipo ?? ""}>
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Material/Cor</th>
              <th className="px-4 py-3 font-medium">Quantidade</th>
              <th className="px-4 py-3 font-medium">Preço/unidade</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.map((item) => {
              const baixo = item.quantidadeAtual <= item.quantidadeMinima;
              return (
                <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/estoque/${item.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                      {item.nome}
                    </Link>
                    {item.fornecedor && <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.fornecedor}</p>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{TIPO_LABEL[item.tipo]}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {[item.material, item.cor].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={baixo ? "font-medium text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-300"}>
                      {formatNumber(item.quantidadeAtual)} {item.unidade.toLowerCase()}
                    </span>
                    {baixo && <Badge color="red" className="ml-2">Baixo</Badge>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(item.precoPorUnidade)}</td>
                  <td className="px-4 py-3">
                    <ItemRowActions item={item} />
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum item de estoque encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
