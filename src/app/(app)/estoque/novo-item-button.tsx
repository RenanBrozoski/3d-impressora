"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InventoryForm } from "./inventory-form";

export function NovoItemButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Novo item
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo item de estoque" widthClassName="max-w-2xl">
        <InventoryForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
