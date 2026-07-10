import { z } from "zod";

export const ClientRequestSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  telefone: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().trim().email("E-mail inválido.")]).optional(),
  descricao: z.string().trim().min(10, "Descreva com um pouco mais de detalhes o que você precisa."),
});
