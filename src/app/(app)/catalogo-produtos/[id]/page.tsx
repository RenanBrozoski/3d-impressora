export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CatalogItemForm } from "../catalog-item-form";
import { ProductTabsNav } from "./product-tabs-nav";
import { ProductImagesTab } from "./product-images-tab";
import { ProductCatalogsTab } from "./product-catalogs-tab";

type Tab = "dados" | "imagens" | "catalogos";

export default async function CatalogoProdutoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: Tab =
    tab === "imagens" || tab === "catalogos" ? tab : "dados";

  const item = await db.catalogItem.findUnique({
    where: { id: Number(id), deletedAt: null },
    include: {
      images: { orderBy: { ordem: "asc" } },
      tags: { include: { tag: true } },
      attributeValues: {
        include: {
          attribute: {
            select: { nome: true, tipo: true, opcoes: true, unidade: true },
          },
        },
      },
      catalogs: {
        orderBy: { ordem: "asc" },
        include: {
          catalog: {
            select: {
              id: true,
              nome: true,
              slug: true,
              attributes: {
                orderBy: { ordem: "asc" },
                include: {
                  attribute: {
                    select: { id: true, nome: true, tipo: true, opcoes: true, unidade: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!item) notFound();

  const [allCatalogs, allAttributes] = await Promise.all([
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

  const linkedCatalogIds = item.catalogs.map((r) => r.catalogId);
  const availableCatalogs = allCatalogs.filter((c) => !linkedCatalogIds.includes(c.id));

  const coverImage = item.images.find((img) => img.isPrimary) ?? item.images[0];

  // Build item data for the form
  const itemFormData = {
    id: item.id,
    nome: item.nome,
    sku: item.sku,
    descricao: item.descricao,
    tamanhoMin: item.tamanhoMin,
    tamanhoMax: item.tamanhoMax,
    dimensoes: item.dimensoes,
    material: item.material,
    cor: item.cor,
    peso: item.peso,
    observacoes: item.observacoes,
    ativo: item.ativo,
    ordemGlobal: item.ordemGlobal,
    catalogIds: linkedCatalogIds,
    tags: item.tags.map((t) => t.tag.nome),
    attributeValues: Object.fromEntries(
      item.attributeValues.map((av) => [String(av.attributeId), av.valor])
    ),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/catalogo-produtos"
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft size={14} />
          Produtos do catálogo
        </Link>

        <div className="flex flex-wrap items-start gap-4">
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage.url}
              alt={coverImage.altText ?? item.nome}
              className="h-20 w-20 shrink-0 rounded-xl border border-[var(--surface-border)] object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {item.nome}
              </h1>
              <Badge color={item.ativo ? "green" : "neutral"}>
                {item.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {item.sku && (
              <p className="mt-1 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                SKU: {item.sku}
              </p>
            )}
            {item.catalogs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.catalogs.map((rel) => (
                  <span
                    key={rel.catalogId}
                    className="inline-flex rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]"
                  >
                    {rel.catalog.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs nav */}
      <ProductTabsNav activeTab={activeTab} />

      {/* Tab content */}
      <div>
        {activeTab === "dados" && (
          <CatalogItemForm
            item={itemFormData}
            catalogs={allCatalogs}
            attributes={allAttributes.map((a) => ({
              ...a,
              opcoes: a.opcoes as string[] | null,
            }))}
          />
        )}

        {activeTab === "imagens" && (
          <div className="card p-5">
            <ProductImagesTab itemId={item.id} images={item.images} />
          </div>
        )}

        {activeTab === "catalogos" && (
          <div className="card p-5">
            <ProductCatalogsTab
              itemId={item.id}
              catalogRels={item.catalogs.map((rel) => ({
                catalogId: rel.catalogId,
                catalog: {
                  id: rel.catalog.id,
                  nome: rel.catalog.nome,
                  slug: rel.catalog.slug,
                  attributes: rel.catalog.attributes.map((al) => ({
                    attributeId: al.attributeId,
                    attribute: {
                      id: al.attribute.id,
                      nome: al.attribute.nome,
                      tipo: al.attribute.tipo,
                      opcoes: al.attribute.opcoes as string[] | null,
                      unidade: al.attribute.unidade,
                    },
                  })),
                },
              }))}
              availableCatalogs={availableCatalogs}
              attributeValues={item.attributeValues.map((av) => ({
                attributeId: av.attributeId,
                valor: av.valor,
                attribute: {
                  nome: av.attribute.nome,
                  tipo: av.attribute.tipo,
                  opcoes: av.attribute.opcoes as string[] | null,
                  unidade: av.attribute.unidade,
                },
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
