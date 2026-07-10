import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AnimatedBackground } from "@/components/animated-background";
import { PrintCube } from "@/components/print-cube";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from "@/lib/status";

export default async function AcompanharPedidoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const order = await db.order.findUnique({
    where: { trackingToken: token },
    include: { customer: { select: { nome: true } }, items: { select: { nomePeca: true, quantidade: true } } },
  });

  if (!order) notFound();

  return (
    <div className="relative mx-auto min-h-screen max-w-lg overflow-hidden px-4 py-10">
      <AnimatedBackground intensity="subtle" />
      <div className="mb-2 flex justify-center">
        <PrintCube size={140} />
      </div>
      <h1 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">Acompanhamento do pedido {order.numero}</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">Olá, {order.customer.nome}</p>

      <div className="mb-4 flex items-center gap-2">
        <Badge color={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
        <Badge color={PAYMENT_STATUS_COLOR[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</Badge>
      </div>

      <div className="card mb-6 p-4">
        <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Prazo de entrega</p>
            <p className="text-neutral-900 dark:text-white">{formatDate(order.prazoEntrega)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor total</p>
            <p className="text-neutral-900 dark:text-white">{formatCurrency(order.valorTotal)}</p>
          </div>
        </div>
        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">Itens</p>
        <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.quantidade}x {item.nomePeca}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Este é um link de acompanhamento público. Não requer login.
      </p>
    </div>
  );
}
