import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { ORDER_STATUS_LABEL } from "@/lib/status";
import { OrderQuoteDocument } from "@/lib/pdf/document";
import { fetchLogoDataUri } from "@/lib/pdf/logo";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id: Number(id) },
    include: { customer: true, items: true, payments: true },
  });
  if (!order) return new Response("Pedido não encontrado.", { status: 404 });

  const settings = await db.settings.findUnique({ where: { id: 1 } });
  const valorPago = order.payments.reduce((sum, p) => sum + p.valor, 0);
  const logoDataUri = await fetchLogoDataUri(settings?.logoPath ?? null);

  const buffer = await renderToBuffer(
    OrderQuoteDocument({
      tipo: "pedido",
      numero: order.numero,
      data: order.dataPedido,
      statusLabel: ORDER_STATUS_LABEL[order.status],
      statusKey: order.status,
      cliente: {
        nome: order.customer.nome,
        telefone: order.customer.telefone,
        email: order.customer.email,
        cpfCnpj: order.customer.cpfCnpj,
      },
      itens: order.items.map((i) => ({
        nomePeca: i.nomePeca,
        material: i.material,
        cor: i.cor,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        valorTotal: i.valorTotal,
      })),
      valorTotal: order.valorTotal,
      valorPago,
      valorPendente: Math.max(order.valorTotal - valorPago, 0),
      observacoes: order.observacoes,
      trackingUrl: `${new URL(request.url).origin}/acompanhar/${order.trackingToken}`,
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
      "Content-Disposition": `inline; filename="${order.numero}.pdf"`,
    },
  });
}
