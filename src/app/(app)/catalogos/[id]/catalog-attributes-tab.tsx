"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  linkAttributeToCatalog,
  unlinkAttributeFromCatalog,
} from "@/app/actions/catalog-attributes";
import { useRouter } from "next/navigation";

interface LinkedAttribute {
  attributeId: number;
  obrigatorio: boolean;
  attribute: {
    id: number;
    nome: string;
    tipo: string;
    unidade?: string | null;
  };
}

interface GlobalAttribute {
  id: number;
  nome: string;
  tipo: string;
}

interface CatalogAttributesTabProps {
  catalogId: number;
  linkedAttributes: LinkedAttribute[];
  allAttributes: GlobalAttribute[];
}

const TIPO_LABEL: Record<string, string> = {
  text: "Texto",
  number: "Número",
  select: "Seleção",
  boolean: "Sim/Não",
};

export function CatalogAttributesTab({
  catalogId,
  linkedAttributes,
  allAttributes,
}: CatalogAttributesTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string>("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const linkedIds = new Set(linkedAttributes.map((a) => a.attributeId));
  const available = allAttributes.filter((a) => !linkedIds.has(a.id));

  function handleLink() {
    if (!selectedId) return;
    startTransition(async () => {
      await linkAttributeToCatalog(catalogId, Number(selectedId));
      setSelectedId("");
      router.refresh();
    });
  }

  function handleUnlink(attributeId: number) {
    setRemovingId(attributeId);
    startTransition(async () => {
      await unlinkAttributeFromCatalog(catalogId, attributeId);
      setRemovingId(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Vincular atributo */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Adicionar atributo ao catálogo
        </p>
        {available.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Todos os atributos globais já estão vinculados.
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
            >
              <option value="">Selecione um atributo...</option>
              {available.map((attr) => (
                <option key={attr.id} value={attr.id}>
                  {attr.nome} ({TIPO_LABEL[attr.tipo] ?? attr.tipo})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLink}
              disabled={!selectedId || isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending && !removingId ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Vincular
            </button>
          </div>
        )}
        <p className="mt-1.5 text-xs text-neutral-500">
          Atributos são globais — "Tamanho" criado aqui pode ser usado em vários catálogos.
        </p>
      </div>

      {/* Atributos vinculados */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Atributos deste catálogo ({linkedAttributes.length})
        </p>

        {linkedAttributes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--surface-border)] py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum atributo vinculado. Adicione atributos para que apareçam nos filtros e produtos.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {linkedAttributes.map((link) => {
              const isRemoving = removingId === link.attributeId && isPending;
              return (
                <div
                  key={link.attributeId}
                  className={`flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2.5 transition-opacity ${isRemoving ? "opacity-40" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {link.attribute.nome}
                      {link.attribute.unidade && (
                        <span className="ml-1 text-xs text-neutral-500">({link.attribute.unidade})</span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {TIPO_LABEL[link.attribute.tipo] ?? link.attribute.tipo}
                      {link.obrigatorio && " · Obrigatório"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnlink(link.attributeId)}
                    disabled={isPending}
                    title="Desvincular deste catálogo"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
