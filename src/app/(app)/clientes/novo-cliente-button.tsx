"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CustomerForm } from "./customer-form";

export function NovoClienteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Novo cliente
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo cliente">
        <CustomerForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
