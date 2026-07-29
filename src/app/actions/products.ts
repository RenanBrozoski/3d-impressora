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
    precoKgMaterial: formValue(formData, "precoKgMaterial"),
    percentualDesperdicio: formValue(formData, "percentualDesperdicio"),
    potenciaImpressoraW: formValue(formData, "potenciaImpressoraW"),
    valorKwh: formValue(formData, "valorKwh"),
    custoHoraMaquina: formValue(formData, "custoHoraMaquina"),
    tempoMaoObraH: formValue(formData, "tempoMaoObraH"),
    valorHoraMaoObra: formValue(formData, "valorHoraMaoObra"),
    custoAcabamento: formValue(formData, "custoAcabamento"),
    custoEmbalagem: formValue(formData, "custoEmbalagem"),
    outrosCustos: formValue(formData, "outrosCustos"),
    taxaMinima: formValue(formData, "taxaMinima"),
    desconto: formValue(formData, "desconto"),
  });
}

type ExtraPayload = { inventoryItemId: number; pesoG: number };

function parseExtras(formData: FormData): ExtraPayload[] {
  const raw = formValue(formData, "extrasJson");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.inventoryItemId === "number" && typeof e.pesoG === "number")
      .map((e) => ({ inventoryItemId: e.inventoryItemId, pesoG: e.pesoG }));
  } catch {
    return [];
  }
}

async function salvarExtras(productId: number, formData: FormData) {
  const extras = parseExtras(formData);
  await db.itemMaterial.deleteMany({ where: { productId } });
  if (extras.length > 0) {
    await db.itemMaterial.createMany({ data: extras.map((e) => ({ ...e, productId })) });
  }
}

// O arquivo já foi enviado direto pro Vercel Blob pelo navegador (ver
// /api/blob-upload) — aqui só persistimos os metadados retornados, sem
// mexer nos bytes do arquivo (evita o limite de payload de Server Actions).
async function salvarModelo3d(productId: number, formData: FormData) {
  const removerModelo = formValue(formData, "removerModelo3d") === "1";
  const url = formValue(formData, "modelo3dUrl");
  const nome = formValue(formData, "modelo3dNome");
  const tamanho = formValue(formData, "modelo3dTamanho");
  const temArquivoNovo = !!url && !!nome;

  if (!removerModelo && !temArquivoNovo) return;

  // Só existe um modelo 3D por produto — remover/substituir apaga o anexo anterior.
  await db.attachment.deleteMany({ where: { productId } });

  if (temArquivoNovo) {
    const ext = nome.slice(nome.lastIndexOf(".")).toLowerCase();
    await db.attachment.create({
      data: {
        nomeArquivo: nome,
        caminho: url,
        tipo: ext.replace(".", "") || "desconhecido",
        tamanhoBytes: Number(tamanho) || 0,
        productId,
      },
    });
  }
}

async function salvarFoto(productId: number, formData: FormData) {
  const removerFoto = formValue(formData, "removerFoto") === "1";
  const url = formValue(formData, "fotoUrl");
  const temArquivoNovo = !!url;

  if (!removerFoto && !temArquivoNovo) return;

  await db.product.update({ where: { id: productId }, data: { fotoPath: temArquivoNovo ? url : null } });
}

export async function createProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const product = await db.product.create({ data: parsed.data });

  await salvarModelo3d(product.id, formData);
  await salvarFoto(product.id, formData);
  await salvarExtras(product.id, formData);

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

  await salvarModelo3d(id, formData);
  await salvarFoto(id, formData);
  await salvarExtras(id, formData);

  revalidatePath("/produtos");
  return { ok: true };
}

export async function duplicateProduct(id: number) {
  await getCurrentUser();
  const original = await db.product.findUnique({ where: { id }, include: { materiaisExtras: true } });
  if (!original) return;

  const copia = await db.product.create({
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
      precoKgMaterial: original.precoKgMaterial,
      percentualDesperdicio: original.percentualDesperdicio,
      potenciaImpressoraW: original.potenciaImpressoraW,
      valorKwh: original.valorKwh,
      custoHoraMaquina: original.custoHoraMaquina,
      tempoMaoObraH: original.tempoMaoObraH,
      valorHoraMaoObra: original.valorHoraMaoObra,
      custoAcabamento: original.custoAcabamento,
      custoEmbalagem: original.custoEmbalagem,
      outrosCustos: original.outrosCustos,
      taxaMinima: original.taxaMinima,
      desconto: original.desconto,
    },
  });

  if (original.materiaisExtras.length > 0) {
    await db.itemMaterial.createMany({
      data: original.materiaisExtras.map((m) => ({ productId: copia.id, inventoryItemId: m.inventoryItemId, pesoG: m.pesoG })),
    });
  }

  revalidatePath("/produtos");
}

export async function setProductStatus(id: number, status: "ATIVO" | "INATIVO") {
  await getCurrentUser();
  await db.product.update({ where: { id }, data: { status } });
  revalidatePath("/produtos");
}

export async function deleteProduct(id: number): Promise<ActionState> {
  await getCurrentUser();

  const [orderItems, quoteItems] = await Promise.all([
    db.orderItem.count({ where: { productId: id } }),
    db.quoteItem.count({ where: { productId: id } }),
  ]);

  if (orderItems + quoteItems > 0) {
    return { erro: "Não é possível excluir: esse produto já foi usado em pedidos ou orçamentos. Use Inativar." };
  }

  await db.product.delete({ where: { id } });
  revalidatePath("/produtos");
  return { ok: true };
}
