"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PRODUCTION_STATUS_COLOR, PRODUCTION_STATUS_LABEL } from "@/lib/status";
import { assignQueueItem, setQueueStatus, registerFailure, createReprint } from "@/app/actions/production";

type Option = { id: number; nome: string };

export function QueueRow({
  queue,
  printers,
  users,
}: {
  queue: {
    id: number;
    status: string;
    prioridade: number;
    isReimpressao: boolean;
    motivoFalha: string | null;
    custoPerdido: number | null;
    printerId: number | null;
    assignedUserId: number | null;
    orderItem: { nomePeca: string; quantidade: number; order: { numero: string; customer: { nome: string } } };
  };
  printers: Option[];
  users: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [printerId, setPrinterId] = useState(queue.printerId ?? "");
  const [assignedUserId, setAssignedUserId] = useState(queue.assignedUserId ?? "");
  const [prioridade, setPrioridade] = useState(queue.prioridade);
  const [failureOpen, setFailureOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  function salvarAtribuicao() {
    startTransition(() =>
      assignQueueItem(queue.id, {
        printerId: printerId ? Number(printerId) : null,
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
        prioridade: Number(prioridade),
      })
    );
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <p className="font-medium text-neutral-900 dark:text-white">{queue.orderItem.nomePeca}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {queue.orderItem.order.numero} · {queue.orderItem.order.customer.nome}
          {queue.isReimpressao && " · reimpressão"}
        </p>
      </td>
      <td className="px-4 py-3">
        <Select value={printerId} onChange={(e) => setPrinterId(e.target.value)} onBlur={salvarAtribuicao} className="w-40">
          <option value="">Sem impressora</option>
          {printers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-3">
        <Select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} onBlur={salvarAtribuicao} className="w-36">
          <option value="">Sem operador</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={prioridade}
          onChange={(e) => setPrioridade(Number(e.target.value))}
          onBlur={salvarAtribuicao}
          className="w-16"
        />
      </td>
      <td className="px-4 py-3">
        <Select
          value={queue.status}
          disabled={pending}
          onChange={(e) => startTransition(() => setQueueStatus(queue.id, e.target.value as never))}
          className="w-44"
        >
          {Object.entries(PRODUCTION_STATUS_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
        <div className="mt-1">
          <Badge color={PRODUCTION_STATUS_COLOR[queue.status]}>{PRODUCTION_STATUS_LABEL[queue.status]}</Badge>
        </div>
        {queue.motivoFalha && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{queue.motivoFalha}</p>}
        {queue.custoPerdido != null && (
          <p className="text-xs text-red-600 dark:text-red-400">Perda: R$ {queue.custoPerdido.toFixed(2)}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm" onClick={() => setFailureOpen(true)}>
            Registrar falha
          </Button>
          {queue.status === "FALHOU" && (
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => startTransition(() => createReprint(queue.id))}>
              Reimprimir
            </Button>
          )}
        </div>
      </td>

      <Modal open={failureOpen} onClose={() => setFailureOpen(false)} title="Registrar falha de impressão">
        <div className="space-y-4">
          <Textarea
            placeholder="Motivo da falha (entupimento, warping, corte de energia...)"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              variant="danger"
              disabled={pending || !motivo.trim()}
              onClick={() =>
                startTransition(async () => {
                  await registerFailure(queue.id, motivo);
                  setFailureOpen(false);
                  setMotivo("");
                })
              }
            >
              Confirmar falha
            </Button>
          </div>
        </div>
      </Modal>
    </tr>
  );
}
