"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDeleteProps {
  onConfirm: () => Promise<unknown>;
  label?: string;
  destructiveLabel?: string;
  size?: "sm" | "md";
}

export function ConfirmDelete({
  onConfirm,
  label = "Excluir",
  destructiveLabel = "Confirmar exclusão",
  size = "sm",
}: ConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <AlertTriangle size={12} className="text-amber-500" />
        <span className="text-xs text-neutral-600 dark:text-neutral-300">Tem certeza?</span>
        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              onConfirm().finally(() => setConfirming(false));
            });
          }}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={10} className="animate-spin" /> : null}
          {destructiveLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md px-2 py-0.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`inline-flex items-center gap-1 rounded-md text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 ${
        size === "sm" ? "p-1" : "px-2 py-1 text-sm"
      }`}
      title={label}
    >
      <Trash2 size={size === "sm" ? 15 : 16} />
      {size === "md" && <span>{label}</span>}
    </button>
  );
}
