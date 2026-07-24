"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { OrderPayloadSchema, PaymentPayloadSchema, type OrderPayload } from "@/lib/validations/order";

const ORDER_STATUS_VALUES = [
  "AGUARDANDO_APROVACAO",
  "APROVADO",
  "NA_FILA",
  "EM_IMPRESSAO",
  "EM_ACABAMENTO",
  "PRONTO_PARA_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
] as const;

export async function createOrder(payload: OrderPayload) {
  await getCurrentUser();
  const parsed = OrderPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const { customerId, prazoEntrega, formaPagamento, observacoes, items } = parsed.data;
  const valorTotal = items.reduce((sum, item) => sum + item.valorTotal, 0);

  const order = await db.order.create({
    data: {
      numero: `TEMP-${Date.now()}`,
      customerId,
      prazoEntrega: prazoEntrega ? new Date(prazoEntrega) : null,
      formaPagamento,
      observacoes,
      valorTotal,
      items: {
        create: items.map(({ produtoId, extras, ...item }) => ({
          ...item,
          productId: produtoId ?? null,
          materiaisExtras: { create: extras.map((e) => ({ inventoryItemId: e.inventoryItemId, pesoG: e.pesoG })) },
        })),
      },
    },
  });

  const numero = `PED-${order.id.toString().padStart(4, "0")}`;
  const createdItems = await db.orderItem.findMany({ where: { orderId: order.id }, select: { id: true } });
  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { numero } }),
    ...createdItems.map((item) => db.productionQueue.create({ data: { orderItemId: item.id } })),
  ]);

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  redirect(`/pedidos/${order.id}`);
}

export async function setOrderStatus(id: number, status: (typeof ORDER_STATUS_VALUES)[number]) {
  await getCurrentUser();
  await db.order.update({ where: { id }, data: { status } });
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/pedidos");
}

export async function deleteOrder(id: number): Promise<{ ok?: boolean; erro?: string }> {
  await getCurrentUser();

  const [movimentos, pagamentos] = await Promise.all([
    db.inventoryMovement.count({ where: { orderItem: { orderId: id } } }),
    db.payment.count({ where: { orderId: id } }),
  ]);

  if (movimentos + pagamentos > 0) {
    return {
      erro: "Não é possível excluir: esse pedido já tem estoque baixado e/ou pagamento registrado. Use Cancelar em vez de excluir.",
    };
  }

  await db.order.delete({ where: { id } });
  revalidatePath("/pedidos");
  return { ok: true };
}

export async function registerDelivery(id: number) {
  await getCurrentUser();
  await db.order.update({ where: { id }, data: { status: "ENTREGUE", dataEntrega: new Date() } });
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/pedidos");
}

export type PaymentActionState = { erro?: string; ok?: boolean } | undefined;

export async function registerPayment(orderId: number, _state: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  await getCurrentUser();

  const parsed = PaymentPayloadSchema.safeParse({
    valor: formData.get("valor"),
    data: formData.get("data"),
    formaPagamento: formData.get("formaPagamento"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { payments: true } });
  if (!order) return { erro: "Pedido não encontrado." };

  await db.payment.create({
    data: {
      orderId,
      valor: parsed.data.valor,
      data: parsed.data.data ? new Date(parsed.data.data) : new Date(),
      formaPagamento: parsed.data.formaPagamento,
      observacoes: parsed.data.observacoes,
    },
  });

  const totalPago = order.payments.reduce((sum, p) => sum + p.valor, 0) + parsed.data.valor;
  const paymentStatus = totalPago >= order.valorTotal ? "PAGO" : totalPago > 0 ? "PARCIAL" : "PENDENTE";

  await db.order.update({ where: { id: orderId }, data: { paymentStatus } });

  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/pedidos");
  revalidatePath("/financeiro");
  return { ok: true };
}
