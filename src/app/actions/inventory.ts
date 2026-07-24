"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { InventoryItemSchema, MovementSchema } from "@/lib/validations/inventory";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function parseInventoryForm(formData: FormData) {
  return InventoryItemSchema.safeParse({
    nome: formValue(formData, "nome"),
    tipo: formValue(formData, "tipo"),
    marca: formValue(formData, "marca"),
    material: formValue(formData, "material"),
    cor: formValue(formData, "cor"),
    corHex: formValue(formData, "corHex"),
    capacidadeMaxima: formValue(formData, "capacidadeMaxima"),
    unidade: formValue(formData, "unidade"),
    quantidadeAtual: formValue(formData, "quantidadeAtual"),
    quantidadeMinima: formValue(formData, "quantidadeMinima"),
    precoCompra: formValue(formData, "precoCompra"),
    precoPorUnidade: formValue(formData, "precoPorUnidade"),
    fornecedor: formValue(formData, "fornecedor"),
    dataCompra: formValue(formData, "dataCompra"),
    observacoes: formValue(formData, "observacoes"),
  });
}

export async function createInventoryItem(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const parsed = parseInventoryForm(formData);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { dataCompra, ...data } = parsed.data;
  await db.inventoryItem.create({ data: { ...data, dataCompra: dataCompra ? new Date(dataCompra) : null } });
  revalidatePath("/estoque");
  revalidatePath("/estoque/filamentos");
  return { ok: true };
}

export async function updateInventoryItem(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const id = Number(formValue(formData, "id"));
  if (!id) return { erro: "Item inválido." };

  const parsed = parseInventoryForm(formData);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { dataCompra, ...data } = parsed.data;
  await db.inventoryItem.update({ where: { id }, data: { ...data, dataCompra: dataCompra ? new Date(dataCompra) : null } });
  revalidatePath("/estoque");
  revalidatePath("/estoque/filamentos");
  return { ok: true };
}

export async function registerMovement(itemId: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();

  const parsed = MovementSchema.safeParse({
    tipo: formValue(formData, "tipo"),
    quantidade: formValue(formData, "quantidade"),
    motivo: formValue(formData, "motivo"),
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const item = await db.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return { erro: "Item não encontrado." };

  const { tipo, quantidade, motivo } = parsed.data;
  const novaQuantidade =
    tipo === "ENTRADA"
      ? item.quantidadeAtual + quantidade
      : tipo === "SAIDA"
        ? item.quantidadeAtual - quantidade
        : quantidade;

  if (novaQuantidade < 0) return { erro: "Quantidade insuficiente em estoque." };

  await db.$transaction([
    db.inventoryItem.update({ where: { id: itemId }, data: { quantidadeAtual: novaQuantidade } }),
    db.inventoryMovement.create({
      data: { inventoryItemId: itemId, tipo, origem: "MANUAL", quantidade, motivo },
    }),
  ]);

  revalidatePath("/estoque");
  revalidatePath("/estoque/filamentos");
  revalidatePath(`/estoque/${itemId}`);
  return { ok: true };
}

export async function deleteInventoryItem(id: number): Promise<ActionState> {
  await getCurrentUser();

  const [movimentos, quoteItems, orderItems, materiaisExtras] = await Promise.all([
    db.inventoryMovement.count({ where: { inventoryItemId: id } }),
    db.quoteItem.count({ where: { inventoryItemId: id } }),
    db.orderItem.count({ where: { inventoryItemId: id } }),
    db.itemMaterial.count({ where: { inventoryItemId: id } }),
  ]);

  if (movimentos + quoteItems + orderItems + materiaisExtras > 0) {
    return {
      erro: "Não é possível excluir: esse insumo já tem movimentações, orçamentos ou pedidos associados. Use um ajuste de estoque para zerá-lo, se necessário.",
    };
  }

  await db.inventoryItem.delete({ where: { id } });
  revalidatePath("/estoque");
  revalidatePath("/estoque/filamentos");
  revalidatePath(`/estoque/${id}`);
  return { ok: true };
}
