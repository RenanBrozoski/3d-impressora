"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CatalogAttributeSchema } from "@/lib/validations/catalog";

export type AttributeActionState = { erro?: string; sucesso?: boolean } | undefined;

// ---------- Criar atributo global ----------

export async function createAttribute(
  _state: AttributeActionState,
  formData: FormData
): Promise<AttributeActionState> {
  const opcoesRaw = formData.get("opcoes");

  const raw = {
    nome: formData.get("nome"),
    tipo: formData.get("tipo") ?? "text",
    opcoes: opcoesRaw ? JSON.parse(String(opcoesRaw)) : null,
    unidade: formData.get("unidade") || null,
  };

  const parsed = CatalogAttributeSchema.safeParse(raw);
  if (!parsed.success) return { erro: parsed.error.errors.map((e) => e.message).join("; ") };

  const existing = await db.catalogAttribute.findUnique({ where: { nome: parsed.data.nome } });
  if (existing) return { erro: "Já existe um atributo com este nome." };

  await db.catalogAttribute.create({
    data: { ...parsed.data, opcoes: parsed.data.opcoes ?? undefined },
  });

  revalidatePath("/catalogo-atributos");
  return { sucesso: true };
}

// ---------- Editar atributo global ----------

export async function updateAttribute(
  id: number,
  _state: AttributeActionState,
  formData: FormData
): Promise<AttributeActionState> {
  const opcoesRaw = formData.get("opcoes");

  const raw = {
    nome: formData.get("nome"),
    tipo: formData.get("tipo") ?? "text",
    opcoes: opcoesRaw ? JSON.parse(String(opcoesRaw)) : null,
    unidade: formData.get("unidade") || null,
  };

  const parsed = CatalogAttributeSchema.safeParse(raw);
  if (!parsed.success) return { erro: parsed.error.errors.map((e) => e.message).join("; ") };

  const conflict = await db.catalogAttribute.findFirst({
    where: { nome: parsed.data.nome, id: { not: id } },
  });
  if (conflict) return { erro: "Já existe outro atributo com este nome." };

  await db.catalogAttribute.update({
    where: { id },
    data: { ...parsed.data, opcoes: parsed.data.opcoes ?? undefined },
  });

  revalidatePath("/catalogo-atributos");
  return { sucesso: true };
}

// ---------- Excluir atributo global ----------

export async function deleteAttribute(id: number): Promise<AttributeActionState> {
  // Vai em cascata para CatalogAttributeLink e CatalogItemAttributeValue
  await db.catalogAttribute.delete({ where: { id } });
  revalidatePath("/catalogo-atributos");
  return { sucesso: true };
}

// ---------- Vincular atributo a um catálogo ----------

export async function linkAttributeToCatalog(
  catalogId: number,
  attributeId: number
): Promise<AttributeActionState> {
  const maxOrdem = await db.catalogAttributeLink.aggregate({
    where: { catalogId },
    _max: { ordem: true },
  });

  await db.catalogAttributeLink.upsert({
    where: { catalogId_attributeId: { catalogId, attributeId } },
    create: { catalogId, attributeId, ordem: (maxOrdem._max.ordem ?? -1) + 1 },
    update: {},
  });

  revalidatePath(`/catalogos/${catalogId}`);
  return { sucesso: true };
}

// ---------- Desvincular atributo de um catálogo ----------

export async function unlinkAttributeFromCatalog(
  catalogId: number,
  attributeId: number
): Promise<AttributeActionState> {
  await db.catalogAttributeLink.deleteMany({ where: { catalogId, attributeId } });
  revalidatePath(`/catalogos/${catalogId}`);
  return { sucesso: true };
}

// ---------- Reordenar atributos dentro de um catálogo ----------

export async function reorderCatalogAttributes(
  catalogId: number,
  attributeIds: number[]
): Promise<AttributeActionState> {
  await Promise.all(
    attributeIds.map((attributeId, idx) =>
      db.catalogAttributeLink.update({
        where: { catalogId_attributeId: { catalogId, attributeId } },
        data: { ordem: idx },
      })
    )
  );
  return { sucesso: true };
}

// ---------- Marcar atributo como obrigatório em catálogo ----------

export async function setAttributeRequired(
  catalogId: number,
  attributeId: number,
  obrigatorio: boolean
): Promise<AttributeActionState> {
  await db.catalogAttributeLink.update({
    where: { catalogId_attributeId: { catalogId, attributeId } },
    data: { obrigatorio },
  });
  return { sucesso: true };
}
