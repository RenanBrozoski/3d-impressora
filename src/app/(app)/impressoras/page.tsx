import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PRINTER_STATUS_COLOR, PRINTER_STATUS_LABEL } from "@/lib/status";
import { NovoPrinterButton } from "./novo-printer-button";
import { PrinterActions } from "./printer-actions";

export default async function ImpressorasPage() {
  const printers = await db.printer.findMany({
    orderBy: { nome: "asc" },
    include: { filaProducao: { select: { status: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Impressoras</h1>
        <NovoPrinterButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {printers.map((printer) => {
          const falhas = printer.filaProducao.filter((f) => f.status === "FALHOU").length;
          const total = printer.filaProducao.length;
          const taxaFalha = total > 0 ? (falhas / total) * 100 : 0;

          return (
            <div key={printer.id} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <Link href={`/impressoras/${printer.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                    {printer.nome}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {printer.tipo} {printer.modelo ? `· ${printer.modelo}` : ""}
                  </p>
                </div>
                <Badge color={PRINTER_STATUS_COLOR[printer.status]}>{PRINTER_STATUS_LABEL[printer.status]}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Potência</p>
                  <p className="text-neutral-900 dark:text-white">{printer.potenciaW} W</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Custo/hora</p>
                  <p className="text-neutral-900 dark:text-white">{formatCurrency(printer.custoEstimadoHora)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Taxa de falha</p>
                  <p className="text-neutral-900 dark:text-white">{taxaFalha.toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-3">
                <PrinterActions printer={printer} />
              </div>
            </div>
          );
        })}

        {printers.length === 0 && (
          <p className="col-span-full py-8 text-center text-neutral-500 dark:text-neutral-400">Nenhuma impressora cadastrada.</p>
        )}
      </div>
    </div>
  );
}
