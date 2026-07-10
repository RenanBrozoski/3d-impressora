"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { ExpenseSchema } from "@/lib/validations/expense";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

export async function createExpense(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();

  const parsed = ExpenseSchema.safeParse({
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    data: formData.get("data"),
    fornecedor: formData.get("fornecedor"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { data, ...rest } = parsed.data;
  await db.expense.create({ data: { ...rest, data: data ? new Date(data) : new Date() } });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { ok: true };
}
