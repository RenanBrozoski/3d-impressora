import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QUOTE_STATUS_COLOR, QUOTE_STATUS_LABEL } from "@/lib/status";
import { QuoteStatusActions } from "./quote-status-actions";
import { PrintButton } from "@/components/print-button";

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await db.quote.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      items: { include: { inventoryItem: { select: { id: true, nome: true, corHex: true } } } },
      order: { select: { id: true, numero: true } },
      clientRequest: { include: { attachments: true } },
    },
  });

  if (!quote) notFound();

  return (
    <div className="print:text-black">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{quote.numero}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Cliente: {quote.customer.nome}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={QUOTE_STATUS_COLOR[quote.status]}>{QUOTE_STATUS_LABEL[quote.status]}</Badge>
          <QuoteStatusActions id={quote.id} status={quote.status} />
        </div>
      </div>

      {quote.order && (
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Convertido no pedido <span className="font-medium text-neutral-900 dark:text-white">{quote.order.numero}</span>.
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 card p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Data</p>
          <p className="text-neutral-900 dark:text-white">{formatDate(quote.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Validade</p>
          <p className="text-neutral-900 dark:text-white">{formatDate(quote.validade)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor final</p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatCurrency(quote.valorFinal)}</p>
        </div>
        {quote.observacoes && (
          <div className="sm:col-span-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Observações</p>
            <p className="text-neutral-900 dark:text-white">{quote.observacoes}</p>
          </div>
        )}
      </div>

      {quote.clientRequest && quote.clientRequest.attachments.length > 0 && (
        <div className="mb-6 card p-4 print:hidden">
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            Anexos da solicitação original do cliente
          </p>
          <div className="flex flex-wrap gap-2">
            {quote.clientRequest.attachments.map((a) => (
              <a
                key={a.id}
                href={`/api/uploads/${encodeURIComponent(a.caminho)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[var(--surface-border)] px-3 py-1.5 text-sm text-neutral-700 transition hover:border-[var(--surface-border-hover)] dark:text-neutral-300"
              >
                {a.nomeArquivo}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-4 py-3 font-medium">Material/Cor</th>
              <th className="px-4 py-3 font-medium">Qtd</th>
              <th className="px-4 py-3 font-medium">Valor unit.</th>
              <th className="px-4 py-3 font-medium">Valor total</th>
              <th className="px-4 py-3 font-medium print:hidden">Lucro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{item.nomePeca}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                  {item.inventoryItem ? (
                    <Link href={`/estoque/${item.inventoryItem.id}`} className="flex items-center gap-1.5 hover:underline print:no-underline">
                      {item.inventoryItem.corHex && (
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--surface-border)]"
                          style={{ backgroundColor: item.inventoryItem.corHex }}
                        />
                      )}
                      {[item.material, item.cor].filter(Boolean).join(" / ") || item.inventoryItem.nome}
                    </Link>
                  ) : (
                    [item.material, item.cor].filter(Boolean).join(" / ") || "-"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{item.quantidade}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(item.valorUnitario)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(item.valorTotal)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 print:hidden">{formatCurrency(item.lucroEstimado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrintButton />
    </div>
  );
}
