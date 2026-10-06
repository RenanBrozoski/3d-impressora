"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeItemFromCatalog } from "@/app/actions/catalog-items";

interface RemoveFromCatalogButtonProps {
  itemId: number;
  catalogId: number;
}

export function RemoveFromCatalogButton({ itemId, catalogId }: RemoveFromCatalogButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleRemove() {
    startTransition(async () => {
      await removeItemFromCatalog(itemId, catalogId);
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs">
        <button
          onClick={handleRemove}
          disabled={pending}
          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
        >
          Remover
        </button>
        <span className="text-neutral-400">/</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-neutral-600 hover:underline dark:text-neutral-300"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Remover do catálogo"
      disabled={pending}
      onClick={() => setConfirming(true)}
    >
      <X size={15} />
    </Button>
  );
}
