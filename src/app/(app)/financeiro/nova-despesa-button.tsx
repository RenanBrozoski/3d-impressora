"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ExpenseForm } from "./expense-form";

export function NovaDespesaButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nova despesa
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova despesa">
        <ExpenseForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
