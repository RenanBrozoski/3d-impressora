import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { PdfGenerator, type CatalogForPdf, type ProductForPdf } from "./pdf-generator";

export default async function PdfCatalogoPage() {
  await getCurrentUser(); // Ensure authenticated

  const [catalogs, allItems, allRelations] = await Promise.all([
    db.catalog.findMany({
      where: { ativo: true, deletedAt: null, tipo: "catalogo" },
      orderBy: { ordem: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    db.catalogItem.findMany({
      where: { ativo: true, deletedAt: null },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sku: true },
    }),
    db.catalogProductRelation.findMany({
      include: { catalog: { select: { id: true, nome: true } } },
    }),
  ]);

  // Build a map: itemId → catalog names
  const catalogNamesByItem = new Map<number, string[]>();
  for (const rel of allRelations) {
    const names = catalogNamesByItem.get(rel.itemId) ?? [];
    names.push(rel.catalog.nome);
    catalogNamesByItem.set(rel.itemId, names);
  }

  const catalogsForPdf: CatalogForPdf[] = catalogs.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    slug: cat.slug,
    icone: cat.icone,
    productCount: cat._count.products,
  }));

  const productsForPdf: ProductForPdf[] = allItems.map((item) => ({
    id: item.id,
    nome: item.nome,
    sku: item.sku,
    catalogNames: catalogNamesByItem.get(item.id) ?? [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Gerador de PDF de Catálogo
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Gere PDFs dos catálogos de produtos para compartilhar com clientes.
        </p>
      </div>

      <PdfGenerator catalogs={catalogsForPdf} products={productsForPdf} />
    </div>
  );
}
