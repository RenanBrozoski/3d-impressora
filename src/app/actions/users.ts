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
    username: formData.get("username"),
    senha: formData.get("senha"),
    papel: formData.get("papel"),
    valorHora: formData.get("valorHora"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const username = parsed.data.username || undefined;

  const existente = await db.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, ...(username ? [{ username }] : [])] },
  });
  if (existente) return { erro: "Já existe um usuário com esse e-mail ou usuário." };

  const senhaHash = await bcrypt.hash(parsed.data.senha, 10);
  await db.user.create({
    data: { nome: parsed.data.nome, email: parsed.data.email, username, senhaHash, papel: parsed.data.papel, valorHora: parsed.data.valorHora },
  });

  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function deleteUser(id: number): Promise<ActionState> {
  const current = await requireAdmin();
  if (current.id === id) {
    return { erro: "Você não pode excluir seu próprio usuário." };
  }

  const [logs, producoes] = await Promise.all([
    db.auditLog.count({ where: { userId: id } }),
    db.productionQueue.count({ where: { assignedUserId: id } }),
  ]);

  if (logs + producoes > 0) {
    return { erro: "Não é possível excluir: esse usuário já tem histórico de auditoria ou produção associado. Desative-o em vez de excluir." };
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function updateUser(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = UpdateUserSchema.safeParse({
    nome: formData.get("nome"),
    username: formData.get("username"),
    papel: formData.get("papel"),
    valorHora: formData.get("valorHora"),
    ativo: formData.get("ativo") === "on",
    novaSenha: formData.get("novaSenha"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { novaSenha, username, ...rest } = parsed.data;

  if (username) {
    const existente = await db.user.findFirst({ where: { username, id: { not: id } } });
    if (existente) return { erro: "Já existe um usuário com esse usuário." };
  }

  await db.user.update({
    where: { id },
    data: {
      ...rest,
      username: username || null,
      ...(novaSenha ? { senhaHash: await bcrypt.hash(novaSenha, 10) } : {}),
    },
  });

  revalidatePath("/configuracoes");
  return { ok: true };
}
