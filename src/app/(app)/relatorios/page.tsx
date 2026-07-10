import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/status";
import {
  getClientesMaisRecorrentes,
  getImpressorasRelatorio,
  getMateriaisMaisConsumidos,
  getProdutosMaisVendidos,
  getTempoMedioProducao,
} from "@/lib/reports";
import { ExportCsvButton } from "@/components/export-csv-button";
import { EmptyState } from "@/components/empty-state";

export default async function RelatoriosPage() {
  const now = new Date();

  const [produtos, clientes, materiais, impressoras, tempoMedio, pedidosAtrasados, estoqueBaixoRaw] = await Promise.all([
    getProdutosMaisVendidos(10),
    getClientesMaisRecorrentes(10),
    getMateriaisMaisConsumidos(10),
    getImpressorasRelatorio(),
    getTempoMedioProducao(),
    db.order.findMany({
      where: { prazoEntrega: { lt: now }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
      include: { customer: { select: { nome: true } } },
      orderBy: { prazoEntrega: "asc" },
    }),
    db.inventoryItem.findMany(),
  ]);

  const estoqueBaixo = estoqueBaixoRaw.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Relatórios</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Tempo médio de produção</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{tempoMedio.toFixed(1)}h</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Pedidos atrasados</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{pedidosAtrasados.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Itens com estoque baixo</p>
          <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">{estoqueBaixo.length}</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Produtos mais vendidos</h2>
          <ExportCsvButton
            data={produtos}
            filename="produtos-mais-vendidos"
            columns={[
              { key: "nome", label: "Peça" },
              { key: "quantidade", label: "Quantidade" },
              { key: "valorTotal", label: "Valor total" },
              { key: "lucro", label: "Lucro" },
            ]}
          />
        </div>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Peça</th>
                <th className="px-4 py-3 font-medium">Qtd. vendida</th>
                <th className="px-4 py-3 font-medium">Valor total</th>
                <th className="px-4 py-3 font-medium">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {produtos.map((p, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-neutral-900 dark:text-white">{p.nome}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{p.quantidade}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(p.valorTotal)}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{formatCurrency(p.lucro)}</td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="Sem dados ainda." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Clientes mais recorrentes</h2>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Pedidos</th>
                <th className="px-4 py-3 font-medium">Total gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {clientes.map((c, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-neutral-900 dark:text-white">{c.nome}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{c.pedidos}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(c.totalGasto)}</td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title="Sem dados ainda." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Materiais mais consumidos</h2>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Consumido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {materiais.map((m, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white">{m.nome}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {formatNumber(m.quantidade)} {String(m.unidade).toLowerCase()}
                    </td>
                  </tr>
                ))}
                {materiais.length === 0 && (
                  <tr>
                    <td colSpan={2}>
                      <EmptyState title="Sem dados ainda." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Impressoras: uso e taxa de falha</h2>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Impressora</th>
                  <th className="px-4 py-3 font-medium">Horas totais</th>
                  <th className="px-4 py-3 font-medium">Taxa de falha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {impressoras.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white">{p.nome}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{p.horasTotais.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{p.taxaFalha.toFixed(0)}%</td>
                  </tr>
                ))}
                {impressoras.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState title="Nenhuma impressora cadastrada." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Pedidos atrasados</h2>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {pedidosAtrasados.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <Link href={`/pedidos/${o.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                      {o.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{o.customer.nome}</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400">{formatDate(o.prazoEntrega)}</td>
                  <td className="px-4 py-3">
                    <Badge color={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  </td>
                </tr>
              ))}
              {pedidosAtrasados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    Nenhum pedido atrasado. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
