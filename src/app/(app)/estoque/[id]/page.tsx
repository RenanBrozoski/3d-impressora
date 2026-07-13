import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { MovementModal } from "../movement-modal";

const TIPO_MOVIMENTO_LABEL: Record<string, string> = { ENTRADA: "Entrada", SAIDA: "Saída", AJUSTE: "Ajuste" };
const TIPO_MOVIMENTO_COLOR: Record<string, string> = { ENTRADA: "green", SAIDA: "red", AJUSTE: "blue" };

export default async function ItemEstoqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.inventoryItem.findUnique({
    where: { id: Number(id) },
    include: {
      movements: {
        orderBy: { createdAt: "desc" },
        include: { orderItem: { include: { order: { select: { id: true, numero: true } } } } },
      },
    },
  });

  if (!item) notFound();

  const baixo = item.quantidadeAtual <= item.quantidadeMinima;
  const percentRestante = item.capacidadeMaxima ? Math.min(100, (item.quantidadeAtual / item.capacidadeMaxima) * 100) : null;
  const pedidosRelacionados = Array.from(
    new Map(
      item.movements
        .filter((m) => m.orderItem?.order)
        .map((m) => [m.orderItem!.order.id, m.orderItem!.order]),
    ).values(),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-900 dark:text-white">
            {item.corHex && (
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--surface-border)]"
                style={{ backgroundColor: item.corHex }}
              />
            )}
            {item.nome}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {[item.material, item.cor].filter(Boolean).join(" / ") || "-"}
          </p>
        </div>
        <MovementModal itemId={item.id} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Quantidade atual</p>
          <p className={`text-xl font-semibold ${baixo ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}`}>
            {formatNumber(item.quantidadeAtual)} {item.unidade.toLowerCase()}
            {item.capacidadeMaxima != null && (
              <span className="text-sm font-normal text-neutral-400"> / {formatNumber(item.capacidadeMaxima)}</span>
            )}
          </p>
          {percentRestante != null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className={`h-full rounded-full ${baixo ? "bg-red-500" : "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"}`}
                style={{ width: `${percentRestante}%` }}
              />
            </div>
          )}
          {baixo && <Badge color="red" className="mt-2">Estoque baixo</Badge>}
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Quantidade mínima</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">
            {formatNumber(item.quantidadeMinima)} {item.unidade.toLowerCase()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Preço/unidade</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(item.precoPorUnidade)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Fornecedor</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{item.fornecedor || "-"}</p>
        </div>
      </div>

      {pedidosRelacionados.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Usado em</h2>
          <div className="flex flex-wrap gap-2">
            {pedidosRelacionados.map((o) => (
              <Link
                key={o.id}
                href={`/pedidos/${o.id}`}
                className="rounded-md border border-[var(--surface-border)] px-3 py-1.5 text-sm text-neutral-700 transition hover:border-[var(--surface-border-hover)] dark:text-neutral-300"
              >
                {o.numero}
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Histórico de movimentações</h2>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Quantidade</th>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {item.movements.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDateTime(m.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge color={TIPO_MOVIMENTO_COLOR[m.tipo]}>{TIPO_MOVIMENTO_LABEL[m.tipo]}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{m.origem}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatNumber(m.quantidade)} {item.unidade.toLowerCase()}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                  {m.orderItem?.order ? (
                    <Link href={`/pedidos/${m.orderItem.order.id}`} className="hover:underline">
                      {m.orderItem.order.numero}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{m.motivo || "-"}</td>
              </tr>
            ))}
            {item.movements.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="Nenhuma movimentação registrada." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
