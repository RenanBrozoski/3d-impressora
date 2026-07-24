"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { ClientRequestSchema } from "@/lib/validations/client-request";
import { saveUploadedFile, UploadError } from "@/lib/upload";

export type ActionState = { erro?: string; ok?: boolean } | undefined;

// Ação pública: qualquer visitante pode chamar, sem sessão (formulário /solicitar).
export async function createClientRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ClientRequestSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    descricao: formData.get("descricao"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Preencha os dados corretamente." };
  }

  const arquivos = formData.getAll("arquivos").filter((f): f is File => f instanceof File && f.size > 0);

  let uploaded: Awaited<ReturnType<typeof saveUploadedFile>>[] = [];
  try {
    uploaded = await Promise.all(arquivos.map(saveUploadedFile));
  } catch (err) {
    if (err instanceof UploadError) return { erro: err.message };
    console.error("Falha ao enviar anexo da solicitação:", err);
    return {
      erro:
        "Não foi possível enviar o arquivo agora. Você pode reenviar a solicitação sem arquivo e nos mandar por WhatsApp, ou tentar novamente em alguns minutos.",
    };
  }

  await db.clientRequest.create({
    data: {
      ...parsed.data,
      attachments: { create: uploaded },
    },
  });

  return { ok: true };
}

export async function setClientRequestStatus(id: number, status: "EM_ANALISE" | "DESCARTADO") {
  await getCurrentUser();
  await db.clientRequest.update({ where: { id }, data: { status } });
  revalidatePath("/solicitacoes");
  revalidatePath(`/solicitacoes/${id}`);
}

export async function deleteClientRequest(id: number): Promise<ActionState> {
  await getCurrentUser();

  const quote = await db.quote.findUnique({ where: { clientRequestId: id } });
  if (quote) {
    return { erro: "Não é possível excluir: essa solicitação já foi convertida em orçamento. Use Descartar." };
  }

  await db.clientRequest.delete({ where: { id } });
  revalidatePath("/solicitacoes");
  revalidatePath(`/solicitacoes/${id}`);
  return { ok: true };
}

export async function convertRequestToQuote(id: number) {
  await getCurrentUser();

  const request = await db.clientRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Solicitação não encontrada.");
  if (request.status === "CONVERTIDO") throw new Error("Solicitação já foi convertida.");

  let customer = request.customerId ? await db.customer.findUnique({ where: { id: request.customerId } }) : null;

  if (!customer) {
    customer =
      (request.email ? await db.customer.findFirst({ where: { email: request.email } }) : null) ??
      (await db.customer.create({
        data: { nome: request.nome, telefone: request.telefone, email: request.email },
      }));
  }

  const quote = await db.quote.create({
    data: {
      numero: `TEMP-${Date.now()}`,
      customerId: customer.id,
      clientRequestId: request.id,
      observacoes: `Solicitação do cliente: ${request.descricao}`,
    },
  });

  const numero = `ORC-${quote.id.toString().padStart(4, "0")}`;
  await db.$transaction([
    db.quote.update({ where: { id: quote.id }, data: { numero } }),
    db.clientRequest.update({ where: { id }, data: { status: "CONVERTIDO", customerId: customer.id } }),
  ]);

  revalidatePath("/solicitacoes");
  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quote.id}/editar`);
}
