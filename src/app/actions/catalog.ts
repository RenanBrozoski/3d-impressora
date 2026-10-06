"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CatalogSchema, CatalogThemeSchema, CatalogPdfThemeSchema } from "@/lib/validations/catalog";
import { put } from "@vercel/blob";

export type CatalogActionState = { erro?: string; sucesso?: boolean } | undefined;

// ---------- Helpers ----------

function buildSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ---------- Criar catálogo ----------

export async function createCatalog(
  _state: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const raw = {
    nome: formData.get("nome"),
    slug: formData.get("slug") || buildSlug(String(formData.get("nome") ?? "")),
    descricao: formData.get("descricao") || null,
    icone: formData.get("icone") || null,
    ativo: formData.get("ativo") === "true",
    ordem: Number(formData.get("ordem") ?? 0),
    tipo: formData.get("tipo") ?? "catalogo",
  };

  const parsed = CatalogSchema.safeParse(raw);
  if (!parsed.success) {
    return { erro: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const exists = await db.catalog.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return { erro: "Já existe um catálogo com este slug." };

  await db.catalog.create({
    data: {
      ...parsed.data,
      theme: { create: {} },
      pdfTheme: { create: {} },
    },
  });

  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Editar catálogo ----------

export async function updateCatalog(
  id: number,
  _state: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const raw = {
    nome: formData.get("nome"),
    slug: formData.get("slug"),
    descricao: formData.get("descricao") || null,
    icone: formData.get("icone") || null,
    ativo: formData.get("ativo") === "true",
    ordem: Number(formData.get("ordem") ?? 0),
    tipo: formData.get("tipo") ?? "catalogo",
  };

  const parsed = CatalogSchema.safeParse(raw);
  if (!parsed.success) {
    return { erro: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const conflict = await db.catalog.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (conflict) return { erro: "Já existe outro catálogo com este slug." };

  await db.catalog.update({ where: { id }, data: parsed.data });

  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${parsed.data.slug}`);
  return { sucesso: true };
}

// ---------- Excluir catálogo (soft delete) ----------

export async function deleteCatalog(id: number): Promise<CatalogActionState> {
  await db.catalog.update({
    where: { id },
    data: { deletedAt: new Date(), ativo: false },
  });
  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Excluir permanente ----------

export async function hardDeleteCatalog(id: number): Promise<CatalogActionState> {
  await db.catalog.delete({ where: { id } });
  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Duplicar catálogo ----------

export async function duplicateCatalog(id: number): Promise<CatalogActionState> {
  const original = await db.catalog.findUnique({
    where: { id },
    include: { theme: true, pdfTheme: true, attributes: true },
  });
  if (!original) return { erro: "Catálogo não encontrado." };

  let slug = `${original.slug}-copia`;
  let attempt = 0;
  while (await db.catalog.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${original.slug}-copia-${attempt}`;
  }

  const { theme, pdfTheme, attributes, id: _id, createdAt: _c, updatedAt: _u, deletedAt: _d, ...rest } = original;

  await db.catalog.create({
    data: {
      ...rest,
      nome: `${original.nome} (cópia)`,
      slug,
      ativo: false,
      theme: theme ? { create: { ...theme, id: undefined, catalogId: undefined } } : { create: {} },
      pdfTheme: pdfTheme ? { create: { ...pdfTheme, id: undefined, catalogId: undefined } } : { create: {} },
      attributes: {
        createMany: {
          data: attributes.map((a) => ({ attributeId: a.attributeId, ordem: a.ordem, obrigatorio: a.obrigatorio })),
          skipDuplicates: true,
        },
      },
    },
  });

  revalidatePath("/catalogos");
  return { sucesso: true };
}

// ---------- Reordenar catálogos ----------

export async function reorderCatalogs(ids: number[]): Promise<CatalogActionState> {
  await Promise.all(
    ids.map((id, idx) => db.catalog.update({ where: { id }, data: { ordem: idx } }))
  );
  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Ativar / desativar ----------

export async function toggleCatalogStatus(id: number, ativo: boolean): Promise<CatalogActionState> {
  await db.catalog.update({ where: { id }, data: { ativo } });
  revalidatePath("/catalogos");
  revalidatePath("/catalogo");
  return { sucesso: true };
}

// ---------- Salvar tema web ----------

export async function saveCatalogTheme(
  catalogId: number,
  _state: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const raw = {
    corPrimaria: formData.get("corPrimaria") ?? "#7c3aed",
    corSecundaria: formData.get("corSecundaria") ?? "#2563eb",
    corTexto: formData.get("corTexto") ?? "#ffffff",
    corFundo: formData.get("corFundo") ?? "#f5f4fb",
    imagemCapa: formData.get("imagemCapa") || null,
    imagemFundo: formData.get("imagemFundo") || null,
    logoUrl: formData.get("logoUrl") || null,
    imagemDeco: formData.get("imagemDeco") || null,
    logoPosition: formData.get("logoPosition") ?? "left",
    fundoOpacidade: Number(formData.get("fundoOpacidade") ?? 0.15),
    cardStyle: formData.get("cardStyle") ?? "rounded",
    fontePrimaria: formData.get("fontePrimaria") || null,
    fonteSecundaria: formData.get("fonteSecundaria") || null,
    cabecalhoTexto: formData.get("cabecalhoTexto") || null,
    rodapeTexto: formData.get("rodapeTexto") || null,
  };

  const parsed = CatalogThemeSchema.safeParse(raw);
  if (!parsed.success) return { erro: parsed.error.errors.map((e) => e.message).join("; ") };

  await db.catalogTheme.upsert({
    where: { catalogId },
    create: { catalogId, ...parsed.data },
    update: parsed.data,
  });

  const catalog = await db.catalog.findUnique({ where: { id: catalogId }, select: { slug: true } });
  revalidatePath(`/catalogo/${catalog?.slug}`);
  return { sucesso: true };
}

// ---------- Salvar tema PDF ----------

export async function saveCatalogPdfTheme(
  catalogId: number,
  _state: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const raw = {
    corPrimaria: formData.get("corPrimaria") ?? "#7c3aed",
    corSecundaria: formData.get("corSecundaria") ?? "#2563eb",
    corTexto: formData.get("corTexto") ?? "#14121f",
    corFundo: formData.get("corFundo") ?? "#ffffff",
    imagemCapa: formData.get("imagemCapa") || null,
    imagemCapaSecao: formData.get("imagemCapaSecao") || null,
    imagemFundo: formData.get("imagemFundo") || null,
    logoUrl: formData.get("logoUrl") || null,
    imagemDeco: formData.get("imagemDeco") || null,
    produtosPorPagina: Number(formData.get("produtosPorPagina") ?? 2),
    exibirNumeracao: formData.get("exibirNumeracao") === "true",
    exibirCabecalho: formData.get("exibirCabecalho") === "true",
    exibirRodape: formData.get("exibirRodape") === "true",
    cabecalhoTexto: formData.get("cabecalhoTexto") || null,
    rodapeTexto: formData.get("rodapeTexto") || null,
    fontePrimaria: formData.get("fontePrimaria") || null,
    fonteSecundaria: formData.get("fonteSecundaria") || null,
  };

  const parsed = CatalogPdfThemeSchema.safeParse(raw);
  if (!parsed.success) return { erro: parsed.error.errors.map((e) => e.message).join("; ") };

  await db.catalogPdfTheme.upsert({
    where: { catalogId },
    create: { catalogId, ...parsed.data },
    update: parsed.data,
  });

  return { sucesso: true };
}

// ---------- Upload de imagem de tema ----------

export async function uploadCatalogImage(
  formData: FormData
): Promise<{ url: string } | { erro: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { erro: "Arquivo inválido." };

  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowed.includes(ext)) return { erro: "Tipo de arquivo não permitido." };
  if (file.size > 10 * 1024 * 1024) return { erro: "Arquivo maior que 10MB." };

  const blob = await put(`catalog-images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url };
}
