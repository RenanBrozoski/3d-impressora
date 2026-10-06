import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { Plus, BookOpen, Eye, Pencil, Copy, ToggleLeft, ToggleRight, Trash2, ExternalLink } from "lucide-react";
import { reorderCatalogs, toggleCatalogStatus } from "@/app/actions/catalog";
import { SortableList } from "@/components/catalog/sortable-list";
import { CatalogRowActions } from "./catalog-row-actions";

export default async function CatalogosPage() {
  await getCurrentUser();

  const catalogs = await db.catalog.findMany({
    where: { deletedAt: null },
    orderBy: { ordem: "asc" },
    include: {
      theme: { select: { corPrimaria: true, imagemCapa: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Catálogos</h1>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {catalogs.length} catálogo{catalogs.length !== 1 ? "s" : ""} •{" "}
            <a
              href="/catalogo"
              target="_blank"
              className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
            >
              Ver página pública <ExternalLink size={12} />
            </a>
          </p>
        </div>
        <Link
          href="/catalogos/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_var(--ring)] transition hover:opacity-90"
        >
          <Plus size={16} />
          Novo catálogo
        </Link>
      </div>

      {catalogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--surface-border)] py-16 text-center">
          <BookOpen size={40} className="text-neutral-300 dark:text-neutral-600" />
          <p className="text-neutral-500 dark:text-neutral-400">Nenhum catálogo cadastrado.</p>
          <Link href="/catalogos/novo" className="text-sm font-medium text-[var(--accent)] hover:underline">
            Criar primeiro catálogo
          </Link>
        </div>
      ) : (
        <div className="card p-4">
          <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
            Arraste para reordenar. A ordem reflete no site e nos PDFs.
          </p>
          <SortableList
            items={catalogs}
            onReorder={(ids) => reorderCatalogs(ids)}
            renderItem={(catalog) => (
              <div className="flex items-center gap-3">
                {/* Preview de cor */}
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-[var(--surface-border)]"
                  style={{
                    background: catalog.theme?.imagemCapa
                      ? `url(${catalog.theme.imagemCapa}) center/cover`
                      : catalog.theme?.corPrimaria ?? "#7c3aed",
                  }}
                >
                  {catalog.icone && !catalog.theme?.imagemCapa && (
                    <span className="flex h-full w-full items-center justify-center text-lg">{catalog.icone}</span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-900 dark:text-white">
                    {catalog.nome}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    /{catalog.slug} · {catalog._count.products} produto{catalog._count.products !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Badge status */}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    catalog.ativo
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {catalog.ativo ? "Ativo" : "Inativo"}
                </span>

                {/* Ações */}
                <CatalogRowActions catalog={catalog} />
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
