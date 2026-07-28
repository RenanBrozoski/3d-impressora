import { z } from "zod";

export const SettingsSchema = z.object({
  nomeLoja: z.string().trim().min(1, "Informe o nome da loja."),
  contatoTelefone: z.string().trim().optional(),
  contatoEmail: z.union([z.literal(""), z.string().trim().email("E-mail inválido.")]).optional(),
  whatsapp: z.string().trim().optional(),
  instagramUrl: z.string().trim().optional(),
  facebookUrl: z.string().trim().optional(),
  enderecoOrcamento: z.string().trim().optional(),
  valorPadraoKwh: z.coerce.number().nonnegative(),
  potenciaPadraoW: z.coerce.number().nonnegative(),
  valorHoraPadraoMaoDeObra: z.coerce.number().nonnegative(),
  margemLucroPadraoPercent: z.coerce.number().nonnegative(),
  taxaMinimaPedido: z.coerce.number().nonnegative(),
  percentualDesperdicioPadrao: z.coerce.number().nonnegative(),
});
