export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { Plus, BookOpen, ExternalLink } from "lucide-react";
import { CatalogSortableList } from "./catalog-sortable-list";

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
          <CatalogSortableList catalogs={catalogs} />
        </div>
      )}
    </div>
  );
}
