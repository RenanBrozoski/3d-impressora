"use client";

import { useState } from "react";
import { Pencil, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { duplicateProduct, setProductStatus, deleteProduct } from "@/app/actions/products";
import { ProductForm } from "./product-form";
import { DeleteButton } from "@/components/delete-button";
import type { ItemEditorRefs } from "@/components/item-editor/types";

type ProductData = {
  id: number;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  pesoMedioG: number | null;
  tempoMedioH: number | null;
  materialRecomendado: string | null;
  custoMedio: number | null;
  precoSugerido: number | null;
  margemSugeridaPercent: number | null;
  observacoesImpressao: string | null;
  status: string;
  fotoPath: string | null;
  precoKgMaterial: number | null;
  percentualDesperdicio: number | null;
  potenciaImpressoraW: number | null;
  valorKwh: number | null;
  custoHoraMaquina: number | null;
  tempoMaoObraH: number | null;
  valorHoraMaoObra: number | null;
  custoAcabamento: number | null;
  custoEmbalagem: number | null;
  outrosCustos: number | null;
  taxaMinima: number | null;
  desconto: number | null;
  attachments: { id: number; nomeArquivo: string; caminho: string }[];
  materiaisExtras: { id: number; inventoryItemId: number; pesoG: number }[];
};

export function ProductRowActions({ product, refs }: { product: ProductData; refs: ItemEditorRefs }) {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => setViewOpen(true)} aria-label="Visualizar produto">
        <Eye size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar produto">
        <Pencil size={16} />
      </Button>
      <form action={duplicateProduct.bind(null, product.id)}>
        <Button variant="ghost" size="icon" type="submit" aria-label="Duplicar produto">
          <Copy size={16} />
        </Button>
      </form>
      <form action={setProductStatus.bind(null, product.id, product.status === "ATIVO" ? "INATIVO" : "ATIVO")}>
        <Button variant="ghost" size="sm" type="submit">
          {product.status === "ATIVO" ? "Inativar" : "Reativar"}
        </Button>
      </form>
      <DeleteButton
        action={() => deleteProduct(product.id)}
        confirmMessage={`Excluir "${product.nome}"? Essa ação não pode ser desfeita.`}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Editar produto" widthClassName="max-w-3xl">
        <ProductForm product={product} refs={refs} onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Visualizar produto" widthClassName="max-w-3xl">
        <ProductForm
          product={product}
          refs={refs}
          onSuccess={() => setViewOpen(false)}
          onCancel={() => setViewOpen(false)}
          readOnly
        />
      </Modal>
    </div>
  );
}
