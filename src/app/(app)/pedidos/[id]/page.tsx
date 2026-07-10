import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from "@/lib/status";
import { OrderStatusSelect } from "./order-status-select";
import { PaymentModal } from "./payment-modal";
import { DeliveryButton } from "./delivery-button";
import { TrackingLink } from "./tracking-link";
import { EmptyState } from "@/components/empty-state";
import { PrintButton } from "@/components/print-button";

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { data: "desc" } },
      quote: { select: { id: true, numero: true } },
    },
  });

  if (!order) notFound();

  const valorPago = order.payments.reduce((sum, p) => sum + p.valor, 0);
  const valorPendente = Math.max(order.valorTotal - valorPago, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{order.numero}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Cliente: <Link href={`/clientes/${order.customer.id}`} className="hover:underline">{order.customer.nome}</Link>
          </p>
          {order.quote && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Originado do orçamento{" "}
              <Link href={`/orcamentos/${order.quote.id}`} className="hover:underline">
                {order.quote.numero}
              </Link>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={PAYMENT_STATUS_COLOR[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</Badge>
          <PaymentModal orderId={order.id} valorPendente={valorPendente} />
          <DeliveryButton id={order.id} disabled={order.status === "ENTREGUE" || order.status === "CANCELADO"} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 card p-4 print:hidden">
        <div className="flex items-center gap-2">
          <Badge color={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          <OrderStatusSelect id={order.id} status={order.status} />
        </div>
        <TrackingLink token={order.trackingToken} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 card p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Data do pedido</p>
          <p className="text-neutral-900 dark:text-white">{formatDate(order.dataPedido)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Prazo de entrega</p>
          <p className="text-neutral-900 dark:text-white">{formatDate(order.prazoEntrega)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Data de entrega</p>
          <p className="text-neutral-900 dark:text-white">{formatDate(order.dataEntrega)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Forma de pagamento</p>
          <p className="text-neutral-900 dark:text-white">{order.formaPagamento || "-"}</p>
        </div>
        {order.observacoes && (
          <div className="sm:col-span-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Observações</p>
            <p className="text-neutral-900 dark:text-white">{order.observacoes}</p>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor total</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(order.valorTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor pago</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(valorPago)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor pendente</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(valorPendente)}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Itens</h2>
      <div className="mb-6 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-4 py-3 font-medium">Material/Cor</th>
              <th className="px-4 py-3 font-medium">Qtd</th>
              <th className="px-4 py-3 font-medium">Valor unit.</th>
              <th className="px-4 py-3 font-medium">Valor total</th>
              <th className="px-4 py-3 font-medium print:hidden">Lucro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{item.nomePeca}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                  {[item.material, item.cor].filter(Boolean).join(" / ") || "-"}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{item.quantidade}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(item.valorUnitario)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(item.valorTotal)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 print:hidden">{formatCurrency(item.lucroEstimado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white print:hidden">Pagamentos</h2>
      <div className="overflow-x-auto card print:hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Forma</th>
              <th className="px-4 py-3 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {order.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDateTime(p.data)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(p.valor)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{p.formaPagamento || "-"}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{p.observacoes || "-"}</td>
              </tr>
            ))}
            {order.payments.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="Nenhum pagamento registrado." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PrintButton />
    </div>
  );
}
