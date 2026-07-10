import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NovaDespesaButton } from "./nova-despesa-button";

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

  const [expenses, payments, receitaAgg, despesaAgg] = await Promise.all([
    db.expense.findMany({ orderBy: { data: "desc" }, take: 30 }),
    db.payment.findMany({
      where: { data: { gte: inicioMes, lte: fimMes } },
      orderBy: { data: "desc" },
      include: { order: { select: { numero: true, customer: { select: { nome: true } } } } },
    }),
    db.payment.aggregate({ _sum: { valor: true }, where: { data: { gte: inicioMes, lte: fimMes } } }),
    db.expense.aggregate({ _sum: { valor: true }, where: { data: { gte: inicioMes, lte: fimMes } } }),
  ]);

  const receitaMes = receitaAgg._sum.valor ?? 0;
  const despesaMes = despesaAgg._sum.valor ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Financeiro</h1>
        <NovaDespesaButton />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Recebido no mês</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(receitaMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Despesas no mês</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(despesaMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Saldo do mês</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(receitaMes - despesaMes)}</p>
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
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      Nenhuma despesa registrada.
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
                    <td colSpan={3} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      Nenhum pagamento recebido neste mês.
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
