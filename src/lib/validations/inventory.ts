import { z } from "zod";

export const InventoryItemSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do item."),
  tipo: z.enum(["FILAMENTO", "RESINA", "EMBALAGEM", "PECA", "FERRAMENTA", "OUTRO"]),
  marca: z.string().trim().optional(),
  material: z.string().trim().optional(),
  cor: z.string().trim().optional(),
  corHex: z.string().trim().optional(),
  capacidadeMaxima: z.union([z.literal(""), z.coerce.number().positive()]).optional().transform((v) => (v === "" ? undefined : v)),
  unidade: z.enum(["KG", "G", "UNIDADE", "LITRO", "ML"]),
  quantidadeAtual: z.coerce.number().nonnegative().default(0),
  quantidadeMinima: z.coerce.number().nonnegative().default(0),
  precoCompra: z.union([z.literal(""), z.coerce.number().nonnegative()]).optional().transform((v) => (v === "" ? undefined : v)),
  precoPorUnidade: z.coerce.number().nonnegative(),
  fornecedor: z.string().trim().optional(),
  dataCompra: z.string().optional(),
  observacoes: z.string().trim().optional(),
});

export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;

export const MovementSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.coerce.number().positive("Informe uma quantidade válida."),
  motivo: z.string().trim().optional(),
});
