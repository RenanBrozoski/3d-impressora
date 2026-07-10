import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PRINTER_STATUS_COLOR, PRINTER_STATUS_LABEL, PRODUCTION_STATUS_COLOR, PRODUCTION_STATUS_LABEL } from "@/lib/status";
import { EmptyState } from "@/components/empty-state";

export default async function ImpressoraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const printer = await db.printer.findUnique({
    where: { id: Number(id) },
    include: {
      filaProducao: {
        orderBy: { createdAt: "desc" },
        include: { orderItem: { select: { nomePeca: true, tempoImpressaoH: true } } },
      },
    },
  });

  if (!printer) notFound();

  const horasTotais = printer.filaProducao.reduce((sum, f) => sum + (f.orderItem.tempoImpressaoH ?? 0), 0);
  const falhas = printer.filaProducao.filter((f) => f.status === "FALHOU").length;
  const total = printer.filaProducao.length;
  const taxaFalha = total > 0 ? (falhas / total) * 100 : 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{printer.nome}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {printer.tipo} {printer.modelo ? `· ${printer.modelo}` : ""}
          </p>
        </div>
        <Badge color={PRINTER_STATUS_COLOR[printer.status]}>{PRINTER_STATUS_LABEL[printer.status]}</Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Horas totais de impressão</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{horasTotais.toFixed(1)}h</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Itens processados</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Taxa de falha</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{taxaFalha.toFixed(0)}%</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Histórico de uso</h2>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-4 py-3 font-medium">Tempo</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {printer.filaProducao.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDateTime(f.createdAt)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{f.orderItem.nomePeca}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{f.orderItem.tempoImpressaoH ?? "-"}h</td>
                <td className="px-4 py-3">
                  <Badge color={PRODUCTION_STATUS_COLOR[f.status]}>{PRODUCTION_STATUS_LABEL[f.status]}</Badge>
                </td>
              </tr>
            ))}
            {printer.filaProducao.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="Nenhum uso registrado ainda." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
