import { z } from "zod";

export const NewUserSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  papel: z.enum(["ADMIN", "OPERADOR"]),
  valorHora: z.coerce.number().nonnegative().optional(),
});

export const UpdateUserSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  papel: z.enum(["ADMIN", "OPERADOR"]),
  valorHora: z.coerce.number().nonnegative().optional(),
  ativo: z.coerce.boolean(),
  novaSenha: z.union([z.literal(""), z.string().min(6, "A senha deve ter ao menos 6 caracteres.")]).optional(),
});
