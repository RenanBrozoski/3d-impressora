"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { ProductSchema } from "@/lib/validations/product";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function parseProductForm(formData: FormData) {
  return ProductSchema.safeParse({
    nome: formValue(formData, "nome"),
    categoria: formValue(formData, "categoria"),
    descricao: formValue(formData, "descricao"),
    pesoMedioG: formValue(formData, "pesoMedioG"),
    tempoMedioH: formValue(formData, "tempoMedioH"),
    materialRecomendado: formValue(formData, "materialRecomendado"),
    custoMedio: formValue(formData, "custoMedio"),
    precoSugerido: formValue(formData, "precoSugerido"),
    margemSugeridaPercent: formValue(formData, "margemSugeridaPercent"),
    observacoesImpressao: formValue(formData, "observacoesImpressao"),
    status: formValue(formData, "status") ?? "ATIVO",
  });
}

export async function createProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.product.create({ data: parsed.data });
  revalidatePath("/produtos");
  return { ok: true };
}

export async function updateProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const id = Number(formValue(formData, "id"));
  if (!id) return { erro: "Produto inválido." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/produtos");
  return { ok: true };
}

export async function duplicateProduct(id: number) {
  await getCurrentUser();
  const original = await db.product.findUnique({ where: { id } });
  if (!original) return;

  await db.product.create({
    data: {
      nome: `${original.nome} (cópia)`,
      categoria: original.categoria,
      descricao: original.descricao,
      fotoPath: original.fotoPath,
      pesoMedioG: original.pesoMedioG,
      tempoMedioH: original.tempoMedioH,
      materialRecomendado: original.materialRecomendado,
      custoMedio: original.custoMedio,
      precoSugerido: original.precoSugerido,
      margemSugeridaPercent: original.margemSugeridaPercent,
      observacoesImpressao: original.observacoesImpressao,
      status: "ATIVO",
    },
  });
  revalidatePath("/produtos");
}

export async function setProductStatus(id: number, status: "ATIVO" | "INATIVO") {
  await getCurrentUser();
  await db.product.update({ where: { id }, data: { status } });
  revalidatePath("/produtos");
}
