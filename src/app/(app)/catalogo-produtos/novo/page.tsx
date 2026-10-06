import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CatalogItemForm } from "../catalog-item-form";

export default async function NovoCatalogoProdutoPage() {
  const [catalogs, attributes] = await Promise.all([
    db.catalog.findMany({
      where: { deletedAt: null },
      select: { id: true, nome: true },
      orderBy: { ordem: "asc" },
    }),
    db.catalogAttribute.findMany({
      select: { id: true, nome: true, tipo: true, opcoes: true, unidade: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  const attributesWithOptions = attributes.map((a) => ({
    ...a,
    opcoes: a.opcoes as string[] | null,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/catalogo-produtos"
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft size={14} />
          Produtos do catálogo
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Novo produto</h1>
      </div>

      <CatalogItemForm catalogs={catalogs} attributes={attributesWithOptions} />
    </div>
  );
}
