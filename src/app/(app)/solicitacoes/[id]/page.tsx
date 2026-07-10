import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CLIENT_REQUEST_STATUS_COLOR, CLIENT_REQUEST_STATUS_LABEL } from "@/lib/status";
import { RequestActions } from "./request-actions";

export default async function SolicitacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await db.clientRequest.findUnique({
    where: { id: Number(id) },
    include: { attachments: true, customer: { select: { id: true, nome: true } }, quote: { select: { id: true, numero: true } } },
  });

  if (!request) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{request.nome}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {[request.telefone, request.email].filter(Boolean).join(" · ") || "Sem contato"} · recebido em{" "}
            {formatDateTime(request.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={CLIENT_REQUEST_STATUS_COLOR[request.status]}>{CLIENT_REQUEST_STATUS_LABEL[request.status]}</Badge>
          <RequestActions id={request.id} status={request.status} />
        </div>
      </div>

      {request.quote && (
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Convertido no orçamento{" "}
          <a href={`/orcamentos/${request.quote.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
            {request.quote.numero}
          </a>
        </p>
      )}

      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">Descrição do pedido</p>
        <p className="whitespace-pre-wrap text-neutral-900 dark:text-white">{request.descricao}</p>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Anexos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {request.attachments.map((a) => (
          <a
            key={a.id}
            href={`/api/uploads/${a.caminho}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-200 bg-white p-3 text-center text-sm text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {a.nomeArquivo}
          </a>
        ))}
        {request.attachments.length === 0 && (
          <p className="col-span-full text-sm text-neutral-500 dark:text-neutral-400">Nenhum arquivo anexado.</p>
        )}
      </div>
    </div>
  );
}
