import { z } from "zod";

const optionalNumber = z
  .union([z.literal(""), z.coerce.number().nonnegative("Deve ser um número positivo.")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const ProductSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do produto."),
  categoria: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  pesoMedioG: optionalNumber,
  tempoMedioH: optionalNumber,
  materialRecomendado: z.string().trim().optional(),
  custoMedio: optionalNumber,
  precoSugerido: optionalNumber,
  margemSugeridaPercent: optionalNumber,
  observacoesImpressao: z.string().trim().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).default("ATIVO"),
  precoKgMaterial: optionalNumber,
  percentualDesperdicio: optionalNumber,
  potenciaImpressoraW: optionalNumber,
  valorKwh: optionalNumber,
  custoHoraMaquina: optionalNumber,
  tempoMaoObraH: optionalNumber,
  valorHoraMaoObra: optionalNumber,
  custoAcabamento: optionalNumber,
  custoEmbalagem: optionalNumber,
  outrosCustos: optionalNumber,
  taxaMinima: optionalNumber,
  desconto: optionalNumber,
});

export type ProductInput = z.infer<typeof ProductSchema>;
