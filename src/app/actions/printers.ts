"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { PrinterSchema } from "@/lib/validations/printer";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function parsePrinterForm(formData: FormData) {
  return PrinterSchema.safeParse({
    nome: formValue(formData, "nome"),
    modelo: formValue(formData, "modelo"),
    tipo: formValue(formData, "tipo"),
    potenciaW: formValue(formData, "potenciaW"),
    areaImpressao: formValue(formData, "areaImpressao"),
    status: formValue(formData, "status") ?? "ATIVA",
    custoEstimadoHora: formValue(formData, "custoEstimadoHora"),
    observacoes: formValue(formData, "observacoes"),
  });
}

export async function createPrinter(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const parsed = parsePrinterForm(formData);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  await db.printer.create({ data: parsed.data });
  revalidatePath("/impressoras");
  return { ok: true };
}

export async function updatePrinter(_state: ActionState, formData: FormData): Promise<ActionState> {
  await getCurrentUser();
  const id = Number(formValue(formData, "id"));
  if (!id) return { erro: "Impressora inválida." };

  const parsed = parsePrinterForm(formData);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  await db.printer.update({ where: { id }, data: parsed.data });
  revalidatePath("/impressoras");
  revalidatePath(`/impressoras/${id}`);
  return { ok: true };
}

export async function setPrinterStatus(id: number, status: "ATIVA" | "MANUTENCAO" | "PARADA") {
  await getCurrentUser();
  await db.printer.update({ where: { id }, data: { status } });
  revalidatePath("/impressoras");
  revalidatePath(`/impressoras/${id}`);
}
