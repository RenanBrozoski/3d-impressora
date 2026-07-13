"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { QuotePayloadSchema, type QuotePayload } from "@/lib/validations/quote";

export async function createQuote(payload: QuotePayload) {
  await getCurrentUser();
  const parsed = QuotePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const { customerId, validade, observacoes, items } = parsed.data;

  const valorSugerido = items.reduce((sum, item) => sum + item.valorTotal, 0);

  const quote = await db.quote.create({
    data: {
      numero: `TEMP-${Date.now()}`,
      customerId,
      validade: validade ? new Date(validade) : null,
      observacoes,
      valorSugerido,
      valorFinal: valorSugerido,
      items: {
        create: items.map(({ produtoId, extras, ...item }) => ({
          ...item,
          productId: produtoId ?? null,
          materiaisExtras: { create: extras.map((e) => ({ inventoryItemId: e.inventoryItemId, pesoG: e.pesoG })) },
        })),
      },
    },
  });

  const numero = `ORC-${quote.id.toString().padStart(4, "0")}`;
  await db.quote.update({ where: { id: quote.id }, data: { numero } });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quote.id}`);
}

export async function updateQuote(id: number, payload: QuotePayload) {
  await getCurrentUser();
  const parsed = QuotePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const { customerId, validade, observacoes, items } = parsed.data;
  const valorSugerido = items.reduce((sum, item) => sum + item.valorTotal, 0);

  await db.$transaction([
    db.quoteItem.deleteMany({ where: { quoteId: id } }),
    db.quote.update({
      where: { id },
      data: {
        customerId,
        validade: validade ? new Date(validade) : null,
        observacoes,
        valorSugerido,
        valorFinal: valorSugerido,
        items: {
          create: items.map(({ produtoId, extras, ...item }) => ({
            ...item,
            productId: produtoId ?? null,
            materiaisExtras: { create: extras.map((e) => ({ inventoryItemId: e.inventoryItemId, pesoG: e.pesoG })) },
          })),
        },
      },
    }),
  ]);

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  redirect(`/orcamentos/${id}`);
}

export async function setQuoteStatus(id: number, status: "ENVIADO" | "APROVADO" | "RECUSADO" | "EXPIRADO") {
  await getCurrentUser();
  await db.quote.update({ where: { id }, data: { status } });
  revalidatePath(`/orcamentos/${id}`);
  revalidatePath("/orcamentos");
}

export async function convertQuoteToOrder(id: number) {
  await getCurrentUser();

  const quote = await db.quote.findUnique({ where: { id }, include: { items: { include: { materiaisExtras: true } } } });
  if (!quote) throw new Error("Orçamento não encontrado.");
  if (quote.status === "CONVERTIDO") throw new Error("Orçamento já foi convertido em pedido.");

  const order = await db.order.create({
    data: {
      numero: `TEMP-${Date.now()}`,
      customerId: quote.customerId,
      quoteId: quote.id,
      valorTotal: quote.valorFinal,
      items: {
        create: quote.items.map((item) => ({
          productId: item.productId,
          inventoryItemId: item.inventoryItemId,
          nomePeca: item.nomePeca,
          quantidade: item.quantidade,
          material: item.material,
          cor: item.cor,
          pesoUnidadeG: item.pesoUnidadeG,
          tempoImpressaoH: item.tempoImpressaoH,
          precoKgMaterial: item.precoKgMaterial,
          percentualDesperdicio: item.percentualDesperdicio,
          potenciaImpressoraW: item.potenciaImpressoraW,
          valorKwh: item.valorKwh,
          custoHoraMaquina: item.custoHoraMaquina,
          tempoMaoObraH: item.tempoMaoObraH,
          valorHoraMaoObra: item.valorHoraMaoObra,
          taxaMinima: item.taxaMinima,
          margemLucroPercent: item.margemLucroPercent,
          desconto: item.desconto,
          custoMaterial: item.custoMaterial,
          custoEnergia: item.custoEnergia,
          custoMaquina: item.custoMaquina,
          custoMaoObra: item.custoMaoObra,
          custoAcabamento: item.custoAcabamento,
          custoEmbalagem: item.custoEmbalagem,
          outrosCustos: item.outrosCustos,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          lucroEstimado: item.lucroEstimado,
          observacoes: item.observacoes,
          materiaisExtras: {
            create: item.materiaisExtras.map((m) => ({ inventoryItemId: m.inventoryItemId, pesoG: m.pesoG })),
          },
        })),
      },
    },
  });

  const numero = `PED-${order.id.toString().padStart(4, "0")}`;
  const createdItems = await db.orderItem.findMany({ where: { orderId: order.id }, select: { id: true } });
  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { numero } }),
    db.quote.update({ where: { id: quote.id }, data: { status: "CONVERTIDO" } }),
    ...createdItems.map((item) => db.productionQueue.create({ data: { orderItemId: item.id } })),
  ]);

  revalidatePath("/orcamentos");
  revalidatePath("/pedidos");
  revalidatePath("/producao");
  redirect(`/pedidos/${order.id}`);
}
