import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { QUOTE_STATUS_COLOR, QUOTE_STATUS_LABEL } from "@/lib/status";

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const quotes = await db.quote.findMany({
    where: status ? { status: status as never } : undefined,
    include: { customer: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Orçamentos</h1>
        <Link href="/orcamentos/novo">
          <Button>
            <Plus size={16} />
            Novo orçamento
          </Button>
        </Link>
      </div>

      <form className="mb-4 max-w-xs" method="get">
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          {Object.entries(QUOTE_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Validade</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-4 py-3">
                  <Link href={`/orcamentos/${quote.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                    {quote.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{quote.customer.nome}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(quote.createdAt)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(quote.validade)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(quote.valorFinal)}</td>
                <td className="px-4 py-3">
                  <Badge color={QUOTE_STATUS_COLOR[quote.status]}>{QUOTE_STATUS_LABEL[quote.status]}</Badge>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
