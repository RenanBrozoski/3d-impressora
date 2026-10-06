import { z } from "zod";

// ---------- Catalog ----------

export const CatalogSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100),
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  descricao: z.string().max(500).optional().nullable(),
  icone: z.string().max(50).optional().nullable(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().default(0),
  tipo: z.enum(["catalogo", "colecao"]).default("catalogo"),
});

export type CatalogInput = z.infer<typeof CatalogSchema>;

// ---------- CatalogTheme ----------

export const CatalogThemeSchema = z.object({
  corPrimaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  corSecundaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2563eb"),
  corTexto: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  corFundo: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f5f4fb"),
  imagemCapa: z.string().url().optional().nullable(),
  imagemFundo: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  imagemDeco: z.string().url().optional().nullable(),
  logoPosition: z.enum(["left", "center", "right"]).default("left"),
  fundoOpacidade: z.number().min(0).max(1).default(0.15),
  cardStyle: z.enum(["rounded", "flat", "outlined"]).default("rounded"),
  fontePrimaria: z.string().max(100).optional().nullable(),
  fonteSecundaria: z.string().max(100).optional().nullable(),
  cabecalhoTexto: z.string().max(200).optional().nullable(),
  rodapeTexto: z.string().max(200).optional().nullable(),
});

export type CatalogThemeInput = z.infer<typeof CatalogThemeSchema>;

// ---------- CatalogPdfTheme ----------

export const CatalogPdfThemeSchema = z.object({
  corPrimaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  corSecundaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2563eb"),
  corTexto: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#14121f"),
  corFundo: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  imagemCapa: z.string().url().optional().nullable(),
  imagemCapaSecao: z.string().url().optional().nullable(),
  imagemFundo: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  imagemDeco: z.string().url().optional().nullable(),
  produtosPorPagina: z.number().int().min(1).max(4).default(2),
  exibirNumeracao: z.boolean().default(true),
  exibirCabecalho: z.boolean().default(true),
  exibirRodape: z.boolean().default(true),
  cabecalhoTexto: z.string().max(200).optional().nullable(),
  rodapeTexto: z.string().max(200).optional().nullable(),
  fontePrimaria: z.string().max(100).optional().nullable(),
  fonteSecundaria: z.string().max(100).optional().nullable(),
});

export type CatalogPdfThemeInput = z.infer<typeof CatalogPdfThemeSchema>;

// ---------- CatalogItem (Produto) ----------

export const CatalogItemSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(200),
  sku: z.string().max(100).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
  tamanhoMin: z.string().max(50).optional().nullable(),
  tamanhoMax: z.string().max(50).optional().nullable(),
  dimensoes: z.string().max(100).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  cor: z.string().max(100).optional().nullable(),
  peso: z.string().max(50).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
  ativo: z.boolean().default(true),
  ordemGlobal: z.number().int().default(0),
  // IDs dos catálogos em que este produto aparece
  catalogIds: z.array(z.number().int()).default([]),
  // Tags (nomes das tags)
  tags: z.array(z.string().min(1).max(50)).default([]),
  // Valores de atributos: { attributeId: valor }
  attributeValues: z.record(z.string(), z.string()).default({}),
});

export type CatalogItemInput = z.infer<typeof CatalogItemSchema>;

// ---------- CatalogAttribute ----------

export const CatalogAttributeSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100),
  tipo: z.enum(["text", "number", "select", "boolean"]).default("text"),
  opcoes: z.array(z.string().min(1)).optional().nullable(),
  unidade: z.string().max(20).optional().nullable(),
});

export type CatalogAttributeInput = z.infer<typeof CatalogAttributeSchema>;

// ---------- Ordenação ----------

export const ReorderSchema = z.object({
  ids: z.array(z.number().int()).min(1),
});
