"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PrinterForm } from "./printer-form";

export function NovoPrinterButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nova impressora
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova impressora">
        <PrinterForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
