"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { deleteAttribute } from "@/app/actions/catalog-attributes";
import { AttributeForm } from "./attribute-form";

type AttributeData = {
  id: number;
  nome: string;
  tipo: string;
  opcoes: string[] | null;
  unidade: string | null;
  _count: { catalogs: number; values: number };
};

const TIPO_LABEL: Record<string, string> = {
  text: "Texto",
  number: "Número",
  select: "Seleção",
  boolean: "Sim/Não",
};

export function AttributeRow({ attr }: { attr: AttributeData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteAttribute(attr.id);
      setConfirming(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Editando: {attr.nome}
          </p>
          <button
            onClick={() => setEditing(false)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X size={16} />
          </button>
        </div>
        <AttributeForm
          attribute={attr}
          onSuccess={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {attr.nome}
          {attr.unidade && (
            <span className="ml-1.5 text-xs text-neutral-500">({attr.unidade})</span>
          )}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            {TIPO_LABEL[attr.tipo] ?? attr.tipo}
          </span>
          <span>{attr._count.catalogs} catálogo{attr._count.catalogs !== 1 ? "s" : ""}</span>
          <span>{attr._count.values} uso{attr._count.values !== 1 ? "s" : ""}</span>
          {attr.opcoes && attr.opcoes.length > 0 && (
            <span className="text-neutral-400">
              Opções: {attr.opcoes.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Excluir?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
          >
            <Check size={13} />
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--surface-border)] text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/5"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-200"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirming(true)}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
