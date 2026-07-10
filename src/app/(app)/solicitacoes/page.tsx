import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CLIENT_REQUEST_STATUS_COLOR, CLIENT_REQUEST_STATUS_LABEL } from "@/lib/status";

export default async function SolicitacoesPage() {
  const requests = await db.clientRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attachments: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">Solicitações de clientes</h1>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--surface-border)] text-left text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Recebido em</th>
              <th className="px-4 py-3 font-medium">Anexos</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-[var(--accent)]/5">
                <td className="px-4 py-3">
                  <Link href={`/solicitacoes/${r.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                    {r.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{r.telefone || r.email || "-"}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDateTime(r.createdAt)}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{r._count.attachments}</td>
                <td className="px-4 py-3">
                  <Badge color={CLIENT_REQUEST_STATUS_COLOR[r.status]}>{CLIENT_REQUEST_STATUS_LABEL[r.status]}</Badge>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhuma solicitação recebida ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
