import { z } from "zod";

export const ExpenseSchema = z.object({
  categoria: z.enum(["MANUTENCAO", "MATERIAL", "EMBALAGEM", "ENERGIA", "MARKETING", "OUTRO"]),
  descricao: z.string().trim().min(2, "Descreva a despesa."),
  valor: z.coerce.number().positive("Informe um valor válido."),
  data: z.string().optional(),
  fornecedor: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});
