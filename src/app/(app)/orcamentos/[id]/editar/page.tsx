import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getItemEditorRefs } from "@/lib/item-refs";
import { QuoteForm } from "../../quote-form";
import type { ItemDraft } from "@/components/item-editor/types";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quoteId = Number(id);

  const [quote, refs, customers] = await Promise.all([
    db.quote.findUnique({
      where: { id: quoteId },
      include: { items: { include: { materiaisExtras: true } }, customer: { select: { nome: true } } },
    }),
    getItemEditorRefs(),
    db.customer.findMany({ where: { ativo: true }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  if (!quote) notFound();

  const items: ItemDraft[] = quote.items.map((item) => ({
    clientId: `item-${item.id}`,
    produtoId: item.productId,
    inventoryItemId: item.inventoryItemId,
    nomePeca: item.nomePeca,
    quantidade: item.quantidade,
    material: item.material ?? "",
    cor: item.cor ?? "",
    observacoes: item.observacoes ?? "",
    extras: item.materiaisExtras.map((m) => ({
      clientId: `extra-${m.id}`,
      inventoryItemId: m.inventoryItemId,
      pesoG: m.pesoG,
    })),
    calc: {
      quantidade: item.quantidade,
      pesoUnidadeG: item.pesoUnidadeG ?? 0,
      precoKgMaterial: item.precoKgMaterial,
      percentualDesperdicio: item.percentualDesperdicio,
      tempoImpressaoH: item.tempoImpressaoH ?? 0,
      potenciaImpressoraW: item.potenciaImpressoraW,
      valorKwh: item.valorKwh,
      custoHoraMaquina: item.custoHoraMaquina,
      tempoMaoObraH: item.tempoMaoObraH,
      valorHoraMaoObra: item.valorHoraMaoObra,
      custoAcabamento: item.custoAcabamento,
      custoEmbalagem: item.custoEmbalagem,
      outrosCustos: item.outrosCustos,
      taxaMinima: item.taxaMinima,
      margemLucroPercent: item.margemLucroPercent,
      desconto: item.desconto,
    },
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">Editar orçamento {quote.numero}</h1>
      <QuoteForm
        refs={refs}
        customers={customers}
        quote={{
          id: quote.id,
          customerNome: quote.customer.nome,
          validade: quote.validade ? quote.validade.toISOString().slice(0, 10) : null,
          observacoes: quote.observacoes,
          items,
        }}
      />
    </div>
  );
}
