"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Image as ImageIcon, ImageOff, Plus, Search, X, Loader2 } from "lucide-react";
import { addItemToCatalog, removeItemFromCatalog } from "@/app/actions/catalog-items";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  nome: string;
  sku?: string | null;
  ativo: boolean;
  images: { url: string; altText?: string | null }[];
}

interface SimpleItem {
  id: number;
  nome: string;
  sku?: string | null;
  images: { url: string }[];
}

interface CatalogProductsTabProps {
  catalogId: number;
  items: Item[];
  allItems: SimpleItem[];
}

export function CatalogProductsTab({ catalogId, items, allItems }: CatalogProductsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string>("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Combobox state
  const [addSearch, setAddSearch] = useState("");
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [addSelectedNome, setAddSelectedNome] = useState("");
  const addRef = useRef<HTMLDivElement>(null);

  const existingIds = new Set(items.map((i) => i.id));
  const available = allItems.filter((i) => !existingIds.has(i.id));
  const filteredAvailable = available.filter((i) => {
    const q = addSearch.toLowerCase();
    return (
      i.nome.toLowerCase().includes(q) ||
      (i.sku ?? "").toLowerCase().includes(q)
    );
  });

  function handleAdd() {
    if (!selectedId) return;
    startTransition(async () => {
      await addItemToCatalog(Number(selectedId), catalogId);
      setSelectedId("");
      setAddSearch("");
      setAddSelectedNome("");
      router.refresh();
    });
  }

  function handleRemove(itemId: number) {
    setRemovingId(itemId);
    startTransition(async () => {
      await removeItemFromCatalog(itemId, catalogId);
      setRemovingId(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Adicionar produto */}
      {available.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Adicionar produto existente
          </p>
          <div className="flex gap-2">
            <div ref={addRef} className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Buscar produto por nome ou SKU..."
                value={addSearch}
                onChange={(e) => {
                  setAddSearch(e.target.value);
                  setAddDropdownOpen(true);
                  if (addSelectedNome) { setAddSelectedNome(""); setSelectedId(""); }
                }}
                onFocus={() => setAddDropdownOpen(true)}
                onBlur={() => setTimeout(() => setAddDropdownOpen(false), 150)}
                className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
              />
              {addSearch && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setAddSearch(""); setSelectedId(""); setAddSelectedNome(""); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={12} />
                </button>
              )}
              {addDropdownOpen && filteredAvailable.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-solid)] shadow-xl">
                  {filteredAvailable.map((item) => {
                    const thumb = item.images[0]?.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedId(String(item.id));
                          setAddSelectedNome(item.nome);
                          setAddSearch(item.nome + (item.sku ? ` (${item.sku})` : ""));
                          setAddDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-hover)]"
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-md border border-[var(--surface-border)] object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--surface-border)] bg-neutral-100 text-xs font-bold text-neutral-400 dark:bg-neutral-800">
                            {item.nome.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-neutral-900 dark:text-white">{item.nome}</p>
                          {item.sku && <p className="text-xs text-neutral-500">{item.sku}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedId || isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Adicionar
            </button>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            Não encontrou?{" "}
            <Link href="/catalogo-produtos/novo" className="text-[var(--accent)] hover:underline">
              Criar novo produto
            </Link>
          </p>
        </div>
      )}

      {/* Lista de produtos */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Produtos neste catálogo ({items.length})
        </p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--surface-border)] py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum produto adicionado ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const cover = item.images[0]?.url;
              const isRemoving = removingId === item.id && isPending;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 transition-opacity ${isRemoving ? "opacity-40" : ""}`}
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={item.images[0]?.altText ?? item.nome}
                      className="h-12 w-12 shrink-0 rounded-lg border border-[var(--surface-border)] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
                      <ImageOff size={18} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{item.nome}</p>
                    {item.sku && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">SKU: {item.sku}</p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.ativo
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {item.ativo ? "Ativo" : "Inativo"}
                  </span>

                  <Link
                    href={`/catalogo-produtos/${item.id}?tab=imagens`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--surface-border)] px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-white/5"
                    title="Gerenciar imagens"
                  >
                    <ImageIcon size={12} />
                    Imagens
                  </Link>

                  <Link
                    href={`/catalogo-produtos/${item.id}`}
                    className="shrink-0 rounded-lg border border-[var(--surface-border)] px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-white/5"
                  >
                    Editar
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={isPending}
                    title="Remover deste catálogo"
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
