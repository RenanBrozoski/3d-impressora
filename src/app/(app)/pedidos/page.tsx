import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from "@/lib/status";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; pagamento?: string; q?: string }>;
}) {
  const { status, pagamento, q } = await searchParams;

  const orders = await db.order.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        pagamento ? { paymentStatus: pagamento as never } : {},
        q ? { customer: { nome: { contains: q } } } : {},
      ],
    },
    include: { customer: { select: { nome: true } } },
    orderBy: { dataPedido: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Pedidos</h1>
        <Link href="/pedidos/novo">
          <Button>
            <Plus size={16} />
            Novo pedido
          </Button>
        </Link>
      </div>

      <form className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" method="get">
        <Input name="q" placeholder="Buscar por cliente..." defaultValue={q ?? ""} />
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="pagamento" defaultValue={pagamento ?? ""}>
          <option value="">Todos os pagamentos</option>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
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
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Prazo</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pagamento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {orders.map((order) => {
              const atrasado =
                order.prazoEntrega &&
                order.prazoEntrega < new Date() &&
                !["ENTREGUE", "CANCELADO"].includes(order.status);
              return (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/pedidos/${order.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                      {order.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{order.customer.nome}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(order.dataPedido)}</td>
                  <td className="px-4 py-3">
                    <span className={atrasado ? "font-medium text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-300"}>
                      {formatDate(order.prazoEntrega)}
                      {atrasado ? " (atrasado)" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(order.valorTotal)}</td>
                  <td className="px-4 py-3">
                    <Badge color={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={PAYMENT_STATUS_COLOR[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</Badge>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
