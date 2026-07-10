"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { NewUserSchema, UpdateUserSchema } from "@/lib/validations/user";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

export async function createUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = NewUserSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    papel: formData.get("papel"),
    valorHora: formData.get("valorHora"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const existente = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existente) return { erro: "Já existe um usuário com esse e-mail." };

  const senhaHash = await bcrypt.hash(parsed.data.senha, 10);
  await db.user.create({
    data: { nome: parsed.data.nome, email: parsed.data.email, senhaHash, papel: parsed.data.papel, valorHora: parsed.data.valorHora },
  });

  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function updateUser(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = UpdateUserSchema.safeParse({
    nome: formData.get("nome"),
    papel: formData.get("papel"),
    valorHora: formData.get("valorHora"),
    ativo: formData.get("ativo") === "on",
    novaSenha: formData.get("novaSenha"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { novaSenha, ...rest } = parsed.data;

  await db.user.update({
    where: { id },
    data: { ...rest, ...(novaSenha ? { senhaHash: await bcrypt.hash(novaSenha, 10) } : {}) },
  });

  revalidatePath("/configuracoes");
  return { ok: true };
}
