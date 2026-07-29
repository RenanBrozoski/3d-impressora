"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "./product-form";
import type { ItemEditorRefs } from "@/components/item-editor/types";

export function NovoProdutoButton({ refs }: { refs: ItemEditorRefs }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Novo produto
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo produto" widthClassName="max-w-3xl">
        <ProductForm refs={refs} onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
