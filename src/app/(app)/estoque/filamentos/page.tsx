import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { NovoItemButton } from "../novo-item-button";
import { ItemRowActions } from "../item-row-actions";

export default async function FilamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; material?: string }>;
}) {
  const { q, material } = await searchParams;

  const materiais = await db.inventoryItem
    .findMany({
      where: { tipo: { in: ["FILAMENTO", "RESINA"] } },
      select: { material: true },
      distinct: ["material"],
    })
    .then((rows) => rows.map((r) => r.material).filter((m): m is string => Boolean(m)));

  const filamentos = await db.inventoryItem.findMany({
    where: {
      tipo: { in: ["FILAMENTO", "RESINA"] },
      AND: [q ? { nome: { contains: q } } : {}, material ? { material } : {}],
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Filamentos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Rolos de filamento e resina disponíveis, com quanto ainda resta de cada um.
          </p>
        </div>
        <NovoItemButton defaultTipo="FILAMENTO" label="Novo filamento" />
      </div>

      <form className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" method="get">
        <Input name="q" placeholder="Buscar por nome..." defaultValue={q ?? ""} />
        <Select name="material" defaultValue={material ?? ""}>
          <option value="">Todos os materiais</option>
          {materiais.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filamentos.map((item) => {
          const baixo = item.quantidadeAtual <= item.quantidadeMinima;
          const percentRestante = item.capacidadeMaxima
            ? Math.min(100, (item.quantidadeAtual / item.capacidadeMaxima) * 100)
            : null;

          return (
            <div key={item.id} className="card flex flex-col p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Link href={`/estoque/${item.id}`} className="flex items-center gap-2 font-medium text-neutral-900 hover:underline dark:text-white">
                  <span
                    className="inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--surface-border)]"
                    style={{ backgroundColor: item.corHex ?? "#888888" }}
                  />
                  {item.nome}
                </Link>
                {baixo && <Badge color="red">Baixo</Badge>}
              </div>

              <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                {[item.marca, item.material, item.cor].filter(Boolean).join(" · ") || "-"}
              </p>

              <div className="mt-auto">
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className={baixo ? "font-medium text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}>
                    {formatNumber(item.quantidadeAtual)} {item.unidade.toLowerCase()}
                  </span>
                  {item.capacidadeMaxima != null && (
                    <span className="text-xs text-neutral-400">de {formatNumber(item.capacidadeMaxima)}</span>
                  )}
                </div>
                {percentRestante != null && (
                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full ${baixo ? "bg-red-500" : "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"}`}
                      style={{ width: `${percentRestante}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[var(--surface-border)] pt-3 text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">{formatCurrency(item.precoPorUnidade)}/{item.unidade.toLowerCase()}</span>
                  <ItemRowActions item={item} />
                </div>
              </div>
            </div>
          );
        })}

        {filamentos.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="Nenhum filamento cadastrado." />
          </div>
        )}
      </div>
    </div>
  );
}
