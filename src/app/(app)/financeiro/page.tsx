import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { NovaDespesaButton } from "./nova-despesa-button";
import { ExpenseDeleteButton } from "./expense-delete-button";

const CATEGORIA_LABEL: Record<string, string> = {
  MANUTENCAO: "Manutenção",
  MATERIAL: "Material",
  EMBALAGEM: "Embalagem",
  ENERGIA: "Energia",
  MARKETING: "Marketing",
  OUTRO: "Outro",
};

export default async function FinanceiroPage() {
  await requireAdmin();

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [expenses, payments, receitaAgg, despesaAgg, vendasAgg, lucroAgg] = await Promise.all([
    db.expense.findMany({ orderBy: { data: "desc" }, take: 30 }),
    db.payment.findMany({
      where: { data: { gte: inicioMes, lte: fimMes } },
      orderBy: { data: "desc" },
      include: { order: { select: { numero: true, customer: { select: { nome: true } } } } },
    }),
    db.payment.aggregate({ _sum: { valor: true }, where: { data: { gte: inicioMes, lte: fimMes } } }),
    db.expense.aggregate({ _sum: { valor: true }, where: { data: { gte: inicioMes, lte: fimMes } } }),
    db.order.aggregate({
      _sum: { valorTotal: true },
      where: { dataPedido: { gte: inicioMes, lte: fimMes }, status: { not: "CANCELADO" } },
    }),
    db.orderItem.aggregate({
      _sum: { lucroEstimado: true },
      where: { order: { dataPedido: { gte: inicioMes, lte: fimMes }, status: { not: "CANCELADO" } } },
    }),
  ]);

  const receitaMes = receitaAgg._sum.valor ?? 0;
  const despesaMes = despesaAgg._sum.valor ?? 0;
  const vendasMes = vendasAgg._sum.valorTotal ?? 0;
  const lucroMes = lucroAgg._sum.lucroEstimado ?? 0;
  const lucroLiquidoMes = lucroMes - despesaMes;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Financeiro</h1>
        <NovaDespesaButton />
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        Vendas / Lucro x Despesa
      </p>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Vendas no mês</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(vendasMes)}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Valor total dos pedidos feitos no mês</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Lucro estimado no mês</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(lucroMes)}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Vendas menos custo estimado das peças</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Despesas no mês</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(despesaMes)}</p>
        </div>
      </div>

      <div className="mb-6 card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Lucro estimado ({formatCurrency(lucroMes)}) − Despesas ({formatCurrency(despesaMes)})
          </p>
          <p
            className={`text-lg font-semibold ${lucroLiquidoMes >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            = {formatCurrency(lucroLiquidoMes)} líquido
          </p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        Fluxo de caixa
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Recebido no mês</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(receitaMes)}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Pagamentos que efetivamente entraram no caixa</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Saldo de caixa do mês</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(receitaMes - despesaMes)}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Recebido menos despesas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Despesas recentes</h2>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3">
                      <p className="text-neutral-900 dark:text-white">{e.descricao}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(e.data)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="neutral">{CATEGORIA_LABEL[e.categoria]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400">{formatCurrency(e.valor)}</td>
                    <td className="px-4 py-3 text-right">
                      <ExpenseDeleteButton id={e.id} descricao={e.descricao} />
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState title="Nenhuma despesa registrada." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Pagamentos recebidos no mês</h2>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-border)]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <p className="text-neutral-900 dark:text-white">{p.order.numero}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{p.order.customer.nome}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(p.data)}</td>
                    <td className="px-4 py-3 text-green-600 dark:text-green-400">{formatCurrency(p.valor)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState title="Nenhum pagamento recebido neste mês." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
