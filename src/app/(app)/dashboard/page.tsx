import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDashboardStats, getFaturamentoPorMes, getPedidosPorStatus } from "@/lib/reports";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatusChart } from "@/components/charts/status-chart";

function StatCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`text-xl font-semibold text-neutral-900 dark:text-white ${className ?? ""}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [user, stats, faturamento, statusData] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(new Date()),
    getFaturamentoPorMes(6),
    getPedidosPorStatus(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900 dark:text-white">Olá, {user.nome.split(" ")[0]}</h1>
      <p className="mb-6 text-neutral-500 dark:text-neutral-400">Resumo do negócio neste mês.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Pedidos no mês" value={stats.totalPedidosMes} />
        <StatCard label="Pendentes" value={stats.pedidosPendentes} />
        <StatCard label="Em produção" value={stats.pedidosEmProducao} />
        <StatCard label="Concluídos" value={stats.pedidosConcluidos} />
        <StatCard label="Entregues" value={stats.pedidosEntregues} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Faturamento do mês" value={formatCurrency(stats.faturamentoMes)} className="text-blue-600 dark:text-blue-400" />
        <StatCard label="Lucro estimado do mês" value={formatCurrency(stats.lucroMes)} className="text-green-600 dark:text-green-400" />
        <StatCard label="Custos do mês" value={formatCurrency(stats.custosMes)} className="text-red-600 dark:text-red-400" />
        <StatCard label="Clientes ativos" value={stats.clientesAtivos} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Faturamento e lucro por mês</h2>
          <RevenueChart data={faturamento} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Pedidos por status</h2>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {stats.estoqueBaixo.length > 0 && (
          <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <AlertTriangle size={16} />
              <h2 className="text-sm font-medium">Estoque baixo</h2>
            </div>
            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
              {stats.estoqueBaixo.map((i) => (
                <li key={i.id}>{i.nome}</li>
              ))}
            </ul>
          </div>
        )}

        {stats.pedidosAtrasados.length > 0 && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <div className="mb-2 flex items-center gap-2 text-red-800 dark:text-red-300">
              <Clock size={16} />
              <h2 className="text-sm font-medium">Pedidos atrasados</h2>
            </div>
            <ul className="space-y-1 text-sm text-red-800 dark:text-red-300">
              {stats.pedidosAtrasados.map((o) => (
                <li key={o.id}>
                  <Link href={`/pedidos/${o.id}`} className="hover:underline">
                    {o.numero} · {o.customer.nome} · {formatDate(o.prazoEntrega)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Próximas entregas</h2>
          <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
            {stats.proximasEntregas.map((o) => (
              <li key={o.id}>
                <Link href={`/pedidos/${o.id}`} className="hover:underline">
                  {o.numero} · {o.customer.nome} · {formatDate(o.prazoEntrega)}
                </Link>
              </li>
            ))}
            {stats.proximasEntregas.length === 0 && <li className="text-neutral-400">Nenhuma entrega agendada.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
