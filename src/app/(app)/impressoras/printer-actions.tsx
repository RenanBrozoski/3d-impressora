"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PrinterForm } from "./printer-form";
import { setPrinterStatus, deletePrinter } from "@/app/actions/printers";
import { DeleteButton } from "@/components/delete-button";

type PrinterData = {
  id: number;
  nome: string;
  modelo: string | null;
  tipo: string;
  potenciaW: number;
  areaImpressao: string | null;
  status: string;
  custoEstimadoHora: number;
  observacoes: string | null;
};

export function PrinterActions({ printer }: { printer: PrinterData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar impressora">
        <Pencil size={16} />
      </Button>
      {printer.status !== "MANUTENCAO" && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(() => setPrinterStatus(printer.id, "MANUTENCAO"))}>
          Manutenção
        </Button>
      )}
      {printer.status !== "ATIVA" && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(() => setPrinterStatus(printer.id, "ATIVA"))}>
          Ativar
        </Button>
      )}
      <DeleteButton
        action={() => deletePrinter(printer.id)}
        confirmMessage={`Excluir a impressora "${printer.nome}"? Essa ação não pode ser desfeita.`}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Editar impressora">
        <PrinterForm printer={printer} onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
