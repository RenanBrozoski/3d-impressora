import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogTabsNav } from "./catalog-tabs-nav";
import { CatalogProductsTab } from "./catalog-products-tab";
import { CatalogAttributesTab } from "./catalog-attributes-tab";
import { CatalogThemeForm } from "./catalog-theme-form";
import { CatalogPdfThemeForm } from "./catalog-pdf-theme-form";

type Tab = "produtos" | "atributos" | "tema-web" | "tema-pdf";

export default async function CatalogoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: Tab =
    tab === "atributos" || tab === "tema-web" || tab === "tema-pdf"
      ? tab
      : "produtos";

  const catalogId = Number(id);

  const [catalog, catalogRelations, allItems, allAttributes] = await Promise.all([
    db.catalog.findUnique({
      where: { id: catalogId, deletedAt: null },
      include: {
        theme: true,
        pdfTheme: true,
        attributes: {
          orderBy: { ordem: "asc" },
          include: { attribute: true },
        },
      },
    }),
    db.catalogProductRelation.findMany({
      where: { catalogId },
      orderBy: { ordem: "asc" },
      include: {
        item: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true, altText: true },
            },
          },
        },
      },
    }),
    db.catalogItem.findMany({
      where: { deletedAt: null },
      select: { id: true, nome: true, sku: true },
      orderBy: { nome: "asc" },
    }),
    db.catalogAttribute.findMany({
      select: { id: true, nome: true, tipo: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!catalog) notFound();

  const items = catalogRelations.map((rel) => ({
    id: rel.item.id,
    nome: rel.item.nome,
    sku: rel.item.sku,
    ativo: rel.item.ativo,
    images: rel.item.images,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/catalogos"
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft size={14} />
          Catálogos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {catalog.icone && (
              <span className="text-3xl">{catalog.icone}</span>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {catalog.nome}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                /{catalog.slug}
                {catalog.tipo === "colecao" && " · coleção"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge color={catalog.ativo ? "green" : "neutral"}>
              {catalog.ativo ? "Ativo" : "Inativo"}
            </Badge>
            <Link href={`/catalogo/${catalog.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink size={14} />
                Ver público
              </Button>
            </Link>
            <Link href={`/catalogos/${catalog.id}/editar`}>
              <Button variant="secondary" size="sm">
                <Pencil size={14} />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {catalog.descricao && (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{catalog.descricao}</p>
        )}
      </div>

      {/* Tabs nav */}
      <CatalogTabsNav activeTab={activeTab} />

      {/* Tab content */}
      <div className="card p-5">
        {activeTab === "produtos" && (
          <CatalogProductsTab catalogId={catalog.id} items={items} allItems={allItems} />
        )}

        {activeTab === "atributos" && (
          <CatalogAttributesTab
            catalogId={catalog.id}
            linkedAttributes={catalog.attributes.map((link) => ({
              attributeId: link.attributeId,
              obrigatorio: link.obrigatorio,
              attribute: {
                id: link.attribute.id,
                nome: link.attribute.nome,
                tipo: link.attribute.tipo,
                unidade: link.attribute.unidade,
              },
            }))}
            allAttributes={allAttributes}
          />
        )}

        {activeTab === "tema-web" && (
          <CatalogThemeForm catalogId={catalog.id} theme={catalog.theme} />
        )}

        {activeTab === "tema-pdf" && (
          <CatalogPdfThemeForm catalogId={catalog.id} pdfTheme={catalog.pdfTheme} />
        )}
      </div>
    </div>
  );
}
