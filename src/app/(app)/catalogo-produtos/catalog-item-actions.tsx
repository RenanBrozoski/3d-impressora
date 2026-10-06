"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Copy, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCatalogItem,
  duplicateCatalogItem,
  toggleCatalogItemStatus,
} from "@/app/actions/catalog-items";

interface CatalogItemActionsProps {
  itemId: number;
  nome: string;
  ativo: boolean;
}

export function CatalogItemActions({ itemId, nome, ativo }: CatalogItemActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateCatalogItem(itemId);
      if (result?.erro) alert(result.erro);
      else router.refresh();
    });
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleCatalogItemStatus(itemId, !ativo);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCatalogItem(itemId);
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  if (confirmingDelete) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
        >
          Sim
        </button>
        <span className="text-neutral-400">/</span>
        <button
          onClick={() => setConfirmingDelete(false)}
          className="text-neutral-600 hover:underline dark:text-neutral-300"
        >
          Não
        </button>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <Link href={`/catalogo-produtos/${itemId}`}>
        <Button variant="ghost" size="icon" aria-label="Editar produto">
          <Pencil size={15} />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Duplicar"
        disabled={pending}
        onClick={handleDuplicate}
      >
        <Copy size={15} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={ativo ? "Desativar" : "Ativar"}
        disabled={pending}
        onClick={handleToggle}
      >
        {ativo ? (
          <ToggleRight size={16} className="text-emerald-500" />
        ) : (
          <ToggleLeft size={16} className="text-neutral-400" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Excluir produto"
        onClick={() => setConfirmingDelete(true)}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
