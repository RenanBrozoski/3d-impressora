"use client";

import { SortableList } from "@/components/catalog/sortable-list";
import { CatalogRowActions } from "./catalog-row-actions";
import { reorderCatalogs } from "@/app/actions/catalog";

type CatalogRow = {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  icone: string | null;
  theme: { corPrimaria: string | null; imagemCapa: string | null } | null;
  _count: { products: number };
};

export function CatalogSortableList({ catalogs }: { catalogs: CatalogRow[] }) {
  return (
    <SortableList
      items={catalogs}
      onReorder={(ids) => reorderCatalogs(ids)}
      renderItem={(catalog) => (
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 rounded-lg border border-[var(--surface-border)]"
            style={{
              background: catalog.theme?.imagemCapa
                ? `url(${catalog.theme.imagemCapa}) center/cover`
                : catalog.theme?.corPrimaria ?? "#7c3aed",
            }}
          >
            {catalog.icone && !catalog.theme?.imagemCapa && (
              <span className="flex h-full w-full items-center justify-center text-lg">
                {catalog.icone}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-neutral-900 dark:text-white">
              {catalog.nome}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              /{catalog.slug} · {catalog._count.products} produto
              {catalog._count.products !== 1 ? "s" : ""}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              catalog.ativo
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {catalog.ativo ? "Ativo" : "Inativo"}
          </span>

          <CatalogRowActions catalog={catalog} />
        </div>
      )}
    />
  );
}
