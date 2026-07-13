import { z } from "zod";

const UsernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.-]+$/, "Usuário deve conter apenas letras, números, ponto, hífen ou underscore.")
  .min(3, "Usuário deve ter ao menos 3 caracteres.");

export const NewUserSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  username: z.union([z.literal(""), UsernameSchema]).optional(),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  papel: z.enum(["ADMIN", "OPERADOR"]),
  valorHora: z.coerce.number().nonnegative().optional(),
});

export const UpdateUserSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  username: z.union([z.literal(""), UsernameSchema]).optional(),
  papel: z.enum(["ADMIN", "OPERADOR"]),
  valorHora: z.coerce.number().nonnegative().optional(),
  ativo: z.coerce.boolean(),
  novaSenha: z.union([z.literal(""), z.string().min(6, "A senha deve ter ao menos 6 caracteres.")]).optional(),
});
