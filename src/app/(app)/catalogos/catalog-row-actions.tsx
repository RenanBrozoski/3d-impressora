"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Copy, Trash2, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCatalog,
  duplicateCatalog,
  toggleCatalogStatus,
} from "@/app/actions/catalog";

interface CatalogRowActionsProps {
  catalog: {
    id: number;
    nome: string;
    slug: string;
    ativo: boolean;
  };
}

export function CatalogRowActions({ catalog }: CatalogRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateCatalog(catalog.id);
      if (result?.erro) alert(result.erro);
      else router.refresh();
    });
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleCatalogStatus(catalog.id, !catalog.ativo);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCatalog(catalog.id);
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  if (confirmingDelete) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs">
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
    <div className="flex shrink-0 items-center gap-0.5">
      <Link href={`/catalogo/${catalog.slug}`} target="_blank">
        <Button variant="ghost" size="icon" aria-label="Ver catálogo público">
          <Eye size={15} />
        </Button>
      </Link>
      <Link href={`/catalogos/${catalog.id}`}>
        <Button variant="ghost" size="icon" aria-label="Detalhes">
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
        aria-label={catalog.ativo ? "Desativar" : "Ativar"}
        disabled={pending}
        onClick={handleToggle}
      >
        {catalog.ativo ? (
          <ToggleRight size={16} className="text-emerald-500" />
        ) : (
          <ToggleLeft size={16} className="text-neutral-400" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Excluir"
        onClick={() => setConfirmingDelete(true)}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
