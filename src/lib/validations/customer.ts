import { z } from "zod";

export const CustomerSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente."),
  telefone: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().trim().email("E-mail inválido.")]).optional(),
  cpfCnpj: z.string().trim().optional(),
  endereco: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
