"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InventoryForm } from "./inventory-form";
import { MovementModal } from "./movement-modal";

type InventoryItemData = {
  id: number;
  nome: string;
  tipo: string;
  marca: string | null;
  material: string | null;
  cor: string | null;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCompra: number | null;
  precoPorUnidade: number;
  fornecedor: string | null;
  observacoes: string | null;
};

export function ItemRowActions({ item }: { item: InventoryItemData }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end gap-1">
      <MovementModal itemId={item.id} />
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar item">
        <Pencil size={16} />
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar item de estoque" widthClassName="max-w-2xl">
        <InventoryForm item={item} onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
