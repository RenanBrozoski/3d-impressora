import { db } from "@/lib/db";
import { Select } from "@/components/ui/input";
import { PRODUCTION_STATUS_LABEL } from "@/lib/status";
import { QueueRow } from "./queue-row";
import { EmptyState } from "@/components/empty-state";

export default async function ProducaoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const [queue, printers, users] = await Promise.all([
    db.productionQueue.findMany({
      where: status ? { status: status as never } : undefined,
      include: { orderItem: { include: { order: { include: { customer: { select: { nome: true } } } } } } },
      orderBy: [{ prioridade: "desc" }, { createdAt: "asc" }],
    }),
    db.printer.findMany({ where: { status: "ATIVA" }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    db.user.findMany({ where: { ativo: true }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">Fila de produção</h1>

      <form className="mb-4 max-w-xs" method="get">
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          {Object.entries(PRODUCTION_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </form>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Peça / Pedido</th>
              <th className="px-4 py-3 font-medium">Impressora</th>
              <th className="px-4 py-3 font-medium">Operador</th>
              <th className="px-4 py-3 font-medium">Prioridade</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {queue.map((q) => (
              <QueueRow key={q.id} queue={q} printers={printers} users={users} />
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="Nenhum item na fila de produção." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
