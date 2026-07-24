import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, whatsappLink } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from "@/lib/status";
import { setCustomerActive } from "@/app/actions/customers";
import { EmptyState } from "@/components/empty-state";
import { EditarClienteButton } from "./editar-cliente-button";
import { CustomerDeleteButton } from "./customer-delete-button";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: { orderBy: { dataPedido: "desc" } },
    },
  });

  if (!customer) notFound();

  const totalGasto = customer.orders.reduce((sum, o) => sum + o.valorTotal, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{customer.nome}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {[customer.telefone, customer.email].filter(Boolean).join(" · ") || "Sem contato cadastrado"}
          </p>
        </div>
        <div className="flex gap-2">
          {customer.telefone && (
            <a href={whatsappLink(customer.telefone)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <MessageCircle size={16} />
                WhatsApp
              </Button>
            </a>
          )}
          <EditarClienteButton customer={customer} />
          <form action={setCustomerActive.bind(null, customer.id, !customer.ativo)}>
            <Button variant={customer.ativo ? "outline" : "secondary"} type="submit">
              {customer.ativo ? "Inativar" : "Reativar"}
            </Button>
          </form>
          <CustomerDeleteButton id={customer.id} nome={customer.nome} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total gasto</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(totalGasto)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Pedidos feitos</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{customer.orders.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Status</p>
          <Badge color={customer.ativo ? "green" : "neutral"}>{customer.ativo ? "Ativo" : "Inativo"}</Badge>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 card p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">CPF/CNPJ</p>
          <p className="text-neutral-900 dark:text-white">{customer.cpfCnpj || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Endereço</p>
          <p className="text-neutral-900 dark:text-white">
            {[customer.endereco, customer.cidade, customer.estado].filter(Boolean).join(", ") || "-"}
          </p>
        </div>
        {customer.observacoes && (
          <div className="sm:col-span-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Observações</p>
            <p className="text-neutral-900 dark:text-white">{customer.observacoes}</p>
          </div>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Histórico de pedidos</h2>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pagamento</th>
              <th className="px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{order.numero}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(order.dataPedido)}</td>
                <td className="px-4 py-3">
                  <Badge color={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge color={PAYMENT_STATUS_COLOR[order.paymentStatus]}>
                    {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(order.valorTotal)}</td>
              </tr>
            ))}
            {customer.orders.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState title="Nenhum pedido ainda." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
