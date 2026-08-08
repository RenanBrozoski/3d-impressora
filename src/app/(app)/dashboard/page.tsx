import Link from "next/link";
import { AlertTriangle, Clock, ClipboardList, Hourglass, Factory, CheckCircle2, Truck, Wallet, TrendingUp, Receipt, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDashboardStats, getFaturamentoPorMes, getPedidosPorStatus } from "@/lib/reports";
import { resolvePeriodo, type PeriodoSearchParams } from "@/lib/period";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatusChart } from "@/components/charts/status-chart";
import { StatCard } from "@/components/stat-card";
import { PeriodFilter } from "@/components/period-filter";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<PeriodoSearchParams> }) {
  const params = await searchParams;
  const periodo = resolvePeriodo(params);

  const [user, stats, faturamento, statusData] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(periodo.inicio, periodo.fim),
    getFaturamentoPorMes(6),
    getPedidosPorStatus(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900 dark:text-white">
        Olá, <span className="text-gradient">{user.nome.split(" ")[0]}</span>
      </h1>
      <p className="mb-4 text-neutral-500 dark:text-neutral-400">Resumo do negócio no período selecionado ({periodo.label}).</p>

      <PeriodFilter basePath="/dashboard" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard index={0} label="Pedidos no período" value={stats.totalPedidosPeriodo} icon={<ClipboardList size={14} />} accent="violet" />
        <StatCard index={1} label="Pendentes" value={stats.pedidosPendentes} icon={<Hourglass size={14} />} accent="yellow" />
        <StatCard index={2} label="Em produção" value={stats.pedidosEmProducao} icon={<Factory size={14} />} accent="blue" />
        <StatCard index={3} label="Concluídos" value={stats.pedidosConcluidos} icon={<CheckCircle2 size={14} />} accent="green" />
        <StatCard index={4} label="Entregues" value={stats.pedidosEntregues} icon={<Truck size={14} />} accent="violet" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          index={5}
          label="Faturamento no período"
          value={formatCurrency(stats.faturamentoPeriodo)}
          icon={<TrendingUp size={14} />}
          accent="blue"
          className="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          index={6}
          label="Lucro estimado no período"
          value={formatCurrency(stats.lucroPeriodo)}
          icon={<Wallet size={14} />}
          accent="green"
          className="text-green-600 dark:text-green-400"
        />
        <StatCard
          index={7}
          label="Custos no período"
          value={formatCurrency(stats.custosPeriodo)}
          icon={<Receipt size={14} />}
          accent="red"
          className="text-red-600 dark:text-red-400"
        />
        <StatCard index={8} label="Clientes ativos" value={stats.clientesAtivos} icon={<Users size={14} />} accent="violet" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Faturamento e lucro por mês</h2>
          <RevenueChart data={faturamento} />
        </div>
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Pedidos por status</h2>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {stats.estoqueBaixo.length > 0 && (
          <div className="card border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle size={16} />
              <h2 className="text-sm font-medium">Estoque baixo</h2>
            </div>
            <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              {stats.estoqueBaixo.map((i) => (
                <li key={i.id}>{i.nome}</li>
              ))}
            </ul>
          </div>
        )}

        {stats.pedidosAtrasados.length > 0 && (
          <div className="card border-red-500/30 bg-red-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
              <Clock size={16} />
              <h2 className="text-sm font-medium">Pedidos atrasados</h2>
            </div>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
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

        <div className="card p-4">
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
