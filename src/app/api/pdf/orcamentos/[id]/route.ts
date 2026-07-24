import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { QUOTE_STATUS_LABEL } from "@/lib/status";
import { OrderQuoteDocument } from "@/lib/pdf/document";
import { fetchLogoDataUri } from "@/lib/pdf/logo";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;

  const quote = await db.quote.findUnique({
    where: { id: Number(id) },
    include: { customer: true, items: true },
  });
  if (!quote) return new Response("Orçamento não encontrado.", { status: 404 });

  const settings = await db.settings.findUnique({ where: { id: 1 } });
  const logoDataUri = await fetchLogoDataUri(settings?.logoPath ?? null);

  const buffer = await renderToBuffer(
    OrderQuoteDocument({
      tipo: "orcamento",
      numero: quote.numero,
      data: quote.createdAt,
      statusLabel: QUOTE_STATUS_LABEL[quote.status],
      statusKey: quote.status,
      cliente: {
        nome: quote.customer.nome,
        telefone: quote.customer.telefone,
        email: quote.customer.email,
        cpfCnpj: quote.customer.cpfCnpj,
      },
      itens: quote.items.map((i) => ({
        nomePeca: i.nomePeca,
        material: i.material,
        cor: i.cor,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        valorTotal: i.valorTotal,
      })),
      valorTotal: quote.valorFinal,
      validade: quote.validade,
      observacoes: quote.observacoes,
      loja: {
        nomeLoja: settings?.nomeLoja ?? "Impressão 3D",
        contatoTelefone: settings?.contatoTelefone ?? null,
        contatoEmail: settings?.contatoEmail ?? null,
        enderecoOrcamento: settings?.enderecoOrcamento ?? null,
      },
      logoDataUri,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.numero}.pdf"`,
    },
  });
}
