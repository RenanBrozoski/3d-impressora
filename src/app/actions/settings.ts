"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { SettingsSchema } from "@/lib/validations/settings";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

export async function updateSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = SettingsSchema.safeParse({
    nomeLoja: formData.get("nomeLoja"),
    contatoTelefone: formData.get("contatoTelefone"),
    contatoEmail: formData.get("contatoEmail"),
    enderecoOrcamento: formData.get("enderecoOrcamento"),
    valorPadraoKwh: formData.get("valorPadraoKwh"),
    potenciaPadraoW: formData.get("potenciaPadraoW"),
    valorHoraPadraoMaoDeObra: formData.get("valorHoraPadraoMaoDeObra"),
    margemLucroPadraoPercent: formData.get("margemLucroPadraoPercent"),
    taxaMinimaPedido: formData.get("taxaMinimaPedido"),
    percentualDesperdicioPadrao: formData.get("percentualDesperdicioPadrao"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  await db.settings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  return { ok: true };
}
