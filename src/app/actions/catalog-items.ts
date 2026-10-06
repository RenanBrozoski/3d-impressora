"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CatalogItemSchema } from "@/lib/validations/catalog";
import { put, del } from "@vercel/blob";

export type CatalogItemActionState = { erro?: string; sucesso?: boolean } | undefined;

// ---------- Criar produto ----------

export async function createCatalogItem(
  _state: CatalogItemActionState,
  formData: FormData
): Promise<CatalogItemActionState> {
  const catalogIdsRaw = formData.get("catalogIds");
  const tagsRaw = formData.get("tags");
  const attrRaw = formData.get("attributeValues");

  const raw = {
    nome: formData.get("nome"),
    sku: formData.get("sku") || null,
    descricao: formData.get("descricao") || null,
    tamanhoMin: formData.get("tamanhoMin") || null,
    tamanhoMax: formData.get("tamanhoMax") || null,
    dimensoes: formData.get("dimensoes") || null,
    material: formData.get("material") || null,
    cor: formData.get("cor") || null,
    peso: formData.get("peso") || null,
    observacoes: formData.get("observacoes") || null,
    ativo: formData.get("ativo") !== "false",
    ordemGlobal: Number(formData.get("ordemGlobal") ?? 0),
    catalogIds: catalogIdsRaw ? JSON.parse(String(catalogIdsRaw)) : [],
    tags: tagsRaw ? JSON.parse(String(tagsRaw)) : [],
    attributeValues: attrRaw ? JSON.parse(String(attrRaw)) : {},
  };

  const parsed = CatalogItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { erro: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const { catalogIds, tags, attributeValues, ...itemData } = parsed.data;

  // Verificar SKU duplicado
  if (itemData.sku) {
    const existing = await db.catalogItem.findUnique({ where: { sku: itemData.sku } });
    if (existing) return { erro: "Já existe um produto com este SKU." };
  }

  // Upsert tags
  const tagRecords = await Promise.all(
    tags.map((nome) =>
      db.catalogTag.upsert({ where: { nome }, create: { nome }, update: {} })
    )
  );

  const item = await db.catalogItem.create({
    data: {
      ...itemData,
      tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      attributeValues: {
        create: Object.entries(attributeValues).map(([attrId, valor]) => ({
          attributeId: Number(attrId),
          valor,
        })),
      },
      catalogs: {
        create: catalogIds.map((catalogId, idx) => ({ catalogId, ordem: idx })),
      },
    },
  });

  revalidatePath("/catalogo-produtos");
  catalogIds.forEach((cid) => revalidatePath(`/catalogos/${cid}`));
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Editar produto ----------

export async function updateCatalogItem(
  id: number,
  _state: CatalogItemActionState,
  formData: FormData
): Promise<CatalogItemActionState> {
  const catalogIdsRaw = formData.get("catalogIds");
  const tagsRaw = formData.get("tags");
  const attrRaw = formData.get("attributeValues");

  const raw = {
    nome: formData.get("nome"),
    sku: formData.get("sku") || null,
    descricao: formData.get("descricao") || null,
    tamanhoMin: formData.get("tamanhoMin") || null,
    tamanhoMax: formData.get("tamanhoMax") || null,
    dimensoes: formData.get("dimensoes") || null,
    material: formData.get("material") || null,
    cor: formData.get("cor") || null,
    peso: formData.get("peso") || null,
    observacoes: formData.get("observacoes") || null,
    ativo: formData.get("ativo") !== "false",
    ordemGlobal: Number(formData.get("ordemGlobal") ?? 0),
    catalogIds: catalogIdsRaw ? JSON.parse(String(catalogIdsRaw)) : [],
    tags: tagsRaw ? JSON.parse(String(tagsRaw)) : [],
    attributeValues: attrRaw ? JSON.parse(String(attrRaw)) : {},
  };

  const parsed = CatalogItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { erro: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const { catalogIds, tags, attributeValues, ...itemData } = parsed.data;

  if (itemData.sku) {
    const conflict = await db.catalogItem.findFirst({
      where: { sku: itemData.sku, id: { not: id } },
    });
    if (conflict) return { erro: "Já existe outro produto com este SKU." };
  }

  const tagRecords = await Promise.all(
    tags.map((nome) =>
      db.catalogTag.upsert({ where: { nome }, create: { nome }, update: {} })
    )
  );

  await db.$transaction([
    db.catalogItem.update({ where: { id }, data: itemData }),
    // Tags
    db.catalogItemTag.deleteMany({ where: { itemId: id } }),
    db.catalogItemTag.createMany({
      data: tagRecords.map((t) => ({ itemId: id, tagId: t.id })),
      skipDuplicates: true,
    }),
    // Valores de atributos
    db.catalogItemAttributeValue.deleteMany({ where: { itemId: id } }),
    db.catalogItemAttributeValue.createMany({
      data: Object.entries(attributeValues).map(([attrId, valor]) => ({
        itemId: id,
        attributeId: Number(attrId),
        valor,
      })),
      skipDuplicates: true,
    }),
    // Relações com catálogos
    db.catalogProductRelation.deleteMany({ where: { itemId: id } }),
    db.catalogProductRelation.createMany({
      data: catalogIds.map((catalogId, idx) => ({ catalogId, itemId: id, ordem: idx })),
      skipDuplicates: true,
    }),
  ]);

  revalidatePath("/catalogo-produtos");
  catalogIds.forEach((cid) => revalidatePath(`/catalogos/${cid}`));
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Excluir (soft delete) ----------

export async function deleteCatalogItem(id: number): Promise<CatalogItemActionState> {
  await db.catalogItem.update({
    where: { id },
    data: { deletedAt: new Date(), ativo: false },
  });
  revalidatePath("/catalogo-produtos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Excluir permanente ----------

export async function hardDeleteCatalogItem(id: number): Promise<CatalogItemActionState> {
  // Excluir imagens do blob antes de apagar o registro
  const images = await db.catalogItemImage.findMany({ where: { itemId: id }, select: { url: true } });
  await Promise.allSettled(images.map((img) => del(img.url)));
  await db.catalogItem.delete({ where: { id } });
  revalidatePath("/catalogo-produtos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Duplicar ----------

export async function duplicateCatalogItem(id: number): Promise<CatalogItemActionState> {
  const original = await db.catalogItem.findUnique({
    where: { id },
    include: {
      tags: true,
      attributeValues: true,
      catalogs: true,
    },
  });
  if (!original) return { erro: "Produto não encontrado." };

  const { id: _id, sku, createdAt: _c, updatedAt: _u, deletedAt: _d, tags, attributeValues, catalogs, ...rest } = original;

  await db.catalogItem.create({
    data: {
      ...rest,
      nome: `${original.nome} (cópia)`,
      sku: sku ? `${sku}-COPIA` : null,
      ativo: false,
      tags: { create: tags.map((t) => ({ tagId: t.tagId })) },
      attributeValues: {
        create: attributeValues.map((av) => ({ attributeId: av.attributeId, valor: av.valor })),
      },
      catalogs: {
        create: catalogs.map((c) => ({ catalogId: c.catalogId, ordem: c.ordem })),
      },
    },
  });

  revalidatePath("/catalogo-produtos");
  return { sucesso: true };
}

// ---------- Ativar / desativar ----------

export async function toggleCatalogItemStatus(id: number, ativo: boolean): Promise<CatalogItemActionState> {
  await db.catalogItem.update({ where: { id }, data: { ativo } });
  revalidatePath("/catalogo-produtos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Reordenar produtos dentro de catálogo ----------

export async function reorderItemsInCatalog(
  catalogId: number,
  itemIds: number[]
): Promise<CatalogItemActionState> {
  await Promise.all(
    itemIds.map((itemId, idx) =>
      db.catalogProductRelation.update({
        where: { catalogId_itemId: { catalogId, itemId } },
        data: { ordem: idx },
      })
    )
  );
  revalidatePath(`/catalogos/${catalogId}`);
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Reordenar produtos globalmente ----------

export async function reorderItemsGlobal(ids: number[]): Promise<CatalogItemActionState> {
  await Promise.all(
    ids.map((id, idx) => db.catalogItem.update({ where: { id }, data: { ordemGlobal: idx } }))
  );
  revalidatePath("/catalogo-produtos");
  return { sucesso: true };
}

// ---------- Upload de imagem ----------

export async function uploadCatalogItemImage(
  itemId: number,
  formData: FormData
): Promise<{ id: number; url: string } | { erro: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { erro: "Arquivo inválido." };

  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowed.includes(ext)) return { erro: "Tipo não permitido. Use JPG, PNG ou WebP." };
  if (file.size > 10 * 1024 * 1024) return { erro: "Imagem maior que 10MB." };

  const isPrimary = formData.get("isPrimary") === "true";

  // Se for primária, remove o flag das outras
  if (isPrimary) {
    await db.catalogItemImage.updateMany({ where: { itemId }, data: { isPrimary: false } });
  }

  const countExisting = await db.catalogItemImage.count({ where: { itemId } });

  const blob = await put(
    `catalog-items/${itemId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`,
    file,
    { access: "public", addRandomSuffix: true }
  );

  const img = await db.catalogItemImage.create({
    data: {
      itemId,
      url: blob.url,
      nomeOriginal: file.name,
      altText: null,
      isPrimary: isPrimary || countExisting === 0,
      ordem: countExisting,
    },
  });

  revalidatePath("/catalogo-produtos");
  revalidatePath("/catalogo");
  return { id: img.id, url: img.url };
}

// ---------- Remover imagem ----------

export async function deleteCatalogItemImage(imageId: number): Promise<CatalogItemActionState> {
  const img = await db.catalogItemImage.findUnique({ where: { id: imageId } });
  if (!img) return { erro: "Imagem não encontrada." };

  await Promise.allSettled([del(img.url)]);
  await db.catalogItemImage.delete({ where: { id: imageId } });

  // Se era primária, promover a próxima
  if (img.isPrimary) {
    const next = await db.catalogItemImage.findFirst({
      where: { itemId: img.itemId },
      orderBy: { ordem: "asc" },
    });
    if (next) await db.catalogItemImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  revalidatePath("/catalogo-produtos");
  return { sucesso: true };
}

// ---------- Definir imagem primária ----------

export async function setPrimaryImage(imageId: number, itemId: number): Promise<CatalogItemActionState> {
  await db.$transaction([
    db.catalogItemImage.updateMany({ where: { itemId }, data: { isPrimary: false } }),
    db.catalogItemImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  revalidatePath("/catalogo-produtos");
  return { sucesso: true };
}

// ---------- Reordenar imagens ----------

export async function reorderItemImages(imageIds: number[]): Promise<CatalogItemActionState> {
  await Promise.all(
    imageIds.map((id, idx) => db.catalogItemImage.update({ where: { id }, data: { ordem: idx } }))
  );
  return { sucesso: true };
}

// ---------- Adicionar produto a catálogo ----------

export async function addItemToCatalog(
  itemId: number,
  catalogId: number
): Promise<CatalogItemActionState> {
  const maxOrdem = await db.catalogProductRelation.aggregate({
    where: { catalogId },
    _max: { ordem: true },
  });
  const ordem = (maxOrdem._max.ordem ?? -1) + 1;

  await db.catalogProductRelation.upsert({
    where: { catalogId_itemId: { catalogId, itemId } },
    create: { catalogId, itemId, ordem },
    update: {},
  });

  revalidatePath(`/catalogos/${catalogId}`);
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Remover produto de catálogo ----------

export async function removeItemFromCatalog(
  itemId: number,
  catalogId: number
): Promise<CatalogItemActionState> {
  await db.catalogProductRelation.deleteMany({ where: { catalogId, itemId } });
  revalidatePath(`/catalogos/${catalogId}`);
  revalidatePath("/catalogo");
  return { sucesso: true };
}
