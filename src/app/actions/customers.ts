"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { CustomerSchema } from "@/lib/validations/customer";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function createCustomer(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();

  const parsed = CustomerSchema.safeParse({
    nome: formValue(formData, "nome"),
    telefone: formValue(formData, "telefone"),
    email: formValue(formData, "email"),
    cpfCnpj: formValue(formData, "cpfCnpj"),
    endereco: formValue(formData, "endereco"),
    cidade: formValue(formData, "cidade"),
    estado: formValue(formData, "estado"),
    observacoes: formValue(formData, "observacoes"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.customer.create({ data: parsed.data });
  revalidatePath("/clientes");
  return { ok: true };
}

export async function updateCustomer(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();

  const id = Number(formValue(formData, "id"));
  if (!id) return { erro: "Cliente inválido." };

  const parsed = CustomerSchema.safeParse({
    nome: formValue(formData, "nome"),
    telefone: formValue(formData, "telefone"),
    email: formValue(formData, "email"),
    cpfCnpj: formValue(formData, "cpfCnpj"),
    endereco: formValue(formData, "endereco"),
    cidade: formValue(formData, "cidade"),
    estado: formValue(formData, "estado"),
    observacoes: formValue(formData, "observacoes"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.customer.update({ where: { id }, data: parsed.data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true };
}

export async function setCustomerActive(id: number, ativo: boolean) {
  await getCurrentUser();
  await db.customer.update({ where: { id }, data: { ativo } });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteCustomer(id: number): Promise<ActionState> {
  await getCurrentUser();

  const [pedidos, orcamentos, solicitacoes] = await Promise.all([
    db.order.count({ where: { customerId: id } }),
    db.quote.count({ where: { customerId: id } }),
    db.clientRequest.count({ where: { customerId: id } }),
  ]);

  if (pedidos + orcamentos + solicitacoes > 0) {
    return {
      erro: "Não é possível excluir: esse cliente já tem pedidos, orçamentos ou solicitações associados. Use Inativar.",
    };
  }

  await db.customer.delete({ where: { id } });
  revalidatePath("/clientes");
  return { ok: true };
}
