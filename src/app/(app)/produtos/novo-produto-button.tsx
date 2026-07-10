"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "./product-form";

export function NovoProdutoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Novo produto
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo produto" widthClassName="max-w-2xl">
        <ProductForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
