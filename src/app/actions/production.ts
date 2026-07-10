"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";

const PRODUCTION_STATUS_VALUES = [
  "NA_FILA",
  "PREPARANDO_ARQUIVO",
  "IMPRIMINDO",
  "PAUSADO",
  "FALHOU",
  "REIMPRIMIR",
  "EM_ACABAMENTO",
  "FINALIZADO",
] as const;
type ProductionStatusValue = (typeof PRODUCTION_STATUS_VALUES)[number];

const DEDUCAO_STATUSES = ["IMPRIMINDO"] as const;

async function baixarEstoqueSeNecessario(queueId: number) {
  const queue = await db.productionQueue.findUnique({
    where: { id: queueId },
    include: { orderItem: { include: { inventoryItem: true, order: { select: { numero: true } } } } },
  });
  if (!queue || queue.estoqueBaixado) return;

  const { orderItem } = queue;
  if (!orderItem.inventoryItemId || !orderItem.inventoryItem) return;

  const pesoTotalG = (orderItem.pesoUnidadeG ?? 0) * orderItem.quantidade;
  const quantidadeConsumida =
    orderItem.inventoryItem.unidade === "KG" ? pesoTotalG / 1000 : orderItem.inventoryItem.unidade === "G" ? pesoTotalG : orderItem.quantidade;

  if (quantidadeConsumida <= 0) return;

  await db.$transaction([
    db.inventoryItem.update({
      where: { id: orderItem.inventoryItemId },
      data: { quantidadeAtual: { decrement: quantidadeConsumida } },
    }),
    db.inventoryMovement.create({
      data: {
        inventoryItemId: orderItem.inventoryItemId,
        tipo: "SAIDA",
        origem: "PEDIDO",
        quantidade: quantidadeConsumida,
        orderItemId: orderItem.id,
        motivo: `Baixa automática - pedido ${orderItem.order.numero} / ${orderItem.nomePeca}`,
      },
    }),
    db.productionQueue.update({ where: { id: queueId }, data: { estoqueBaixado: true } }),
  ]);
}

export async function assignQueueItem(
  id: number,
  data: { printerId: number | null; assignedUserId: number | null; prioridade: number }
) {
  await getCurrentUser();
  await db.productionQueue.update({ where: { id }, data });
  revalidatePath("/producao");
}

export async function setQueueStatus(id: number, status: ProductionStatusValue) {
  await getCurrentUser();

  const data: { status: ProductionStatusValue; dataInicioReal?: Date; dataFimReal?: Date } = { status };
  if (status === "IMPRIMINDO") data.dataInicioReal = new Date();
  if (status === "FINALIZADO") data.dataFimReal = new Date();

  await db.productionQueue.update({ where: { id }, data });

  if (DEDUCAO_STATUSES.includes(status as (typeof DEDUCAO_STATUSES)[number])) {
    await baixarEstoqueSeNecessario(id);
  }

  revalidatePath("/producao");
  revalidatePath("/estoque");
}

export async function registerFailure(id: number, motivo: string) {
  await getCurrentUser();

  const queue = await db.productionQueue.findUnique({ where: { id }, include: { orderItem: true } });
  if (!queue) throw new Error("Item de produção não encontrado.");

  const custoPerdido = queue.orderItem.custoMaterial * queue.orderItem.quantidade;

  await db.productionQueue.update({
    where: { id },
    data: { status: "FALHOU", motivoFalha: motivo, custoPerdido },
  });

  revalidatePath("/producao");
}

export async function createReprint(id: number) {
  await getCurrentUser();

  const original = await db.productionQueue.findUnique({ where: { id } });
  if (!original) throw new Error("Item de produção não encontrado.");

  await db.productionQueue.create({
    data: {
      orderItemId: original.orderItemId,
      printerId: original.printerId,
      assignedUserId: original.assignedUserId,
      isReimpressao: true,
      status: "NA_FILA",
    },
  });

  revalidatePath("/producao");
}
