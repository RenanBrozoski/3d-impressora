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
    whatsapp: formData.get("whatsapp"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
    enderecoOrcamento: formData.get("enderecoOrcamento"),
    valorPadraoKwh: formData.get("valorPadraoKwh"),
    potenciaPadraoW: formData.get("potenciaPadraoW"),
    valorHoraPadraoMaoDeObra: formData.get("valorHoraPadraoMaoDeObra"),
    margemLucroPadraoPercent: formData.get("margemLucroPadraoPercent"),
    taxaMinimaPedido: formData.get("taxaMinimaPedido"),
    percentualDesperdicioPadrao: formData.get("percentualDesperdicioPadrao"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  // O logo já foi enviado direto pro Vercel Blob pelo navegador (ver
  // /api/blob-upload) — aqui só persistimos a URL retornada.
  const removerLogo = formData.get("removerLogo") === "1";
  const logoUrl = formData.get("logoUrl");
  const logoPath = removerLogo ? null : typeof logoUrl === "string" && logoUrl ? logoUrl : undefined;

  await db.settings.upsert({
    where: { id: 1 },
    update: { ...parsed.data, ...(logoPath !== undefined ? { logoPath } : {}) },
    create: { id: 1, ...parsed.data, logoPath: logoPath ?? null },
  });

  // Nome da loja e padrões da calculadora aparecem em toda a área logada (layout
  // raiz) e em páginas públicas geradas estaticamente (/solicitar, /login) — sem
  // revalidar a partir da raiz, essas páginas continuariam com o valor antigo em
  // cache até o próximo deploy.
  revalidatePath("/", "layout");
  return { ok: true };
}
