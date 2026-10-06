export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Search, SlidersHorizontal, FileDown } from "lucide-react";
import { ProductGrid, type ProductItem, type CatalogAttributeForDisplay } from "./product-grid";

type SearchParamsShape = {
  q?: string;
  tag?: string;
  sort?: string;
  [key: string]: string | undefined;
};

export default async function CatalogoSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsShape>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tagFilter = sp.tag ?? "";
  const sort = sp.sort ?? "ordem";

  const catalog = await db.catalog.findFirst({
    where: { slug, ativo: true, deletedAt: null },
    include: {
      theme: true,
      pdfTheme: true,
      attributes: {
        include: { attribute: true },
        orderBy: { ordem: "asc" },
      },
      products: {
        include: {
          item: {
            include: {
              images: { orderBy: [{ isPrimary: "desc" }, { ordem: "asc" }] },
              tags: { include: { tag: true } },
              attributeValues: { include: { attribute: true } },
            },
          },
        },
        orderBy: { ordem: "asc" },
      },
    },
  });

  if (!catalog) notFound();

  const theme = catalog.theme;
  const corPrimaria = theme?.corPrimaria ?? "#7c3aed";
  const corSecundaria = theme?.corSecundaria ?? "#2563eb";
  const corTexto = theme?.corTexto ?? "#ffffff";
  const corFundo = theme?.corFundo ?? "#f5f4fb";
  const imagemCapa = theme?.imagemCapa;
  const cardStyle = theme?.cardStyle ?? "rounded";

  // Catalog attributes for display
  const catalogAttributes: CatalogAttributeForDisplay[] = catalog.attributes.map((al) => ({
    id: al.attribute.id,
    nome: al.attribute.nome,
    unidade: al.attribute.unidade,
  }));

  // Flatten items
  let items: ProductItem[] = catalog.products
    .filter((rel) => rel.item.ativo && !rel.item.deletedAt)
    .map((rel) => rel.item as unknown as ProductItem);

  // Build attribute filter params: attr_<id>=value
  const attrFilters: { id: number; valor: string }[] = [];
  for (const [key, val] of Object.entries(sp)) {
    if (key.startsWith("attr_") && val) {
      const id = Number(key.replace("attr_", ""));
      if (!isNaN(id)) attrFilters.push({ id, valor: val });
    }
  }

  // Collect unique tags from all products
  const allTags = Array.from(
    new Set(items.flatMap((item) => item.tags.map((t) => t.tag.nome)))
  ).sort();

  // Collect unique attribute values per catalog attribute
  const attrUniqueValues: Record<number, string[]> = {};
  for (const attr of catalogAttributes) {
    const vals = Array.from(
      new Set(
        items
          .map((item) => item.attributeValues.find((av) => av.attribute.id === attr.id)?.valor)
          .filter(Boolean) as string[]
      )
    ).sort();
    if (vals.length > 1) attrUniqueValues[attr.id] = vals;
  }

  // Apply text search
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(
      (item) =>
        item.nome.toLowerCase().includes(ql) ||
        (item.sku ?? "").toLowerCase().includes(ql) ||
        (item.descricao ?? "").toLowerCase().includes(ql)
    );
  }

  // Apply tag filter
  if (tagFilter) {
    items = items.filter((item) => item.tags.some((t) => t.tag.nome === tagFilter));
  }

  // Apply attribute filters
  for (const { id, valor } of attrFilters) {
    items = items.filter((item) =>
      item.attributeValues.some((av) => av.attribute.id === id && av.valor === valor)
    );
  }

  // Sort
  if (sort === "nome") {
    items = [...items].sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (sort === "sku") {
    items = [...items].sort((a, b) => (a.sku ?? "").localeCompare(b.sku ?? ""));
  } else if (sort === "recentes") {
    items = [...items].sort((a, b) => b.id - a.id);
  }
  // "ordem" keeps the original order from Prisma (orderBy: { ordem: "asc" })

  const totalProducts = catalog.products.filter(
    (rel) => rel.item.ativo && !rel.item.deletedAt
  ).length;

  const hasFilters = q || tagFilter || attrFilters.length > 0;

  return (
    <div
      style={
        {
          "--cat-primary": corPrimaria,
          "--cat-secondary": corSecundaria,
          "--cat-text": corTexto,
          "--cat-bg": corFundo,
        } as React.CSSProperties
      }
    >
      {/* ===== HERO ===== */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${corPrimaria} 0%, ${corSecundaria} 100%)` }}
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div
          className="pointer-events-none absolute right-52 top-10 h-36 w-36 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {imagemCapa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagemCapa}
            alt={catalog.nome}
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          {catalog.icone && (
            <div
              className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              {catalog.icone}
            </div>
          )}

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ color: corTexto }}
          >
            {catalog.nome}
          </h1>

          {catalog.descricao && (
            <p
              className="mt-3 max-w-2xl text-lg leading-relaxed"
              style={{ color: corTexto, opacity: 0.88 }}
            >
              {catalog.descricao}
            </p>
          )}

          {theme?.cabecalhoTexto && (
            <p className="mt-2 text-sm" style={{ color: corTexto, opacity: 0.72 }}>
              {theme.cabecalhoTexto}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.18)", color: corTexto }}
            >
              {totalProducts} produto{totalProducts !== 1 ? "s" : ""}
            </span>

            <a
              href={`/api/catalogo/pdf?catalogId=${catalog.id}`}
              download
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: "rgba(255,255,255,0.95)", color: corPrimaria }}
            >
              <FileDown size={15} />
              Baixar PDF
            </a>
          </div>
        </div>
      </div>

      {/* ===== STICKY SEARCH BAR ===== */}
      <div
        className="sticky top-14 z-20 border-b shadow-sm"
        style={{ background: corFundo, borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <form method="get" className="flex flex-wrap gap-2">
            {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
            {attrFilters.map(({ id, valor }) => (
              <input key={id} type="hidden" name={`attr_${id}`} value={valor} />
            ))}

            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome, SKU ou descrição..."
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-[var(--cat-primary)] focus:ring-2 focus:ring-[var(--cat-primary)]/20"
              />
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
            >
              <option value="ordem">Ordem padrão</option>
              <option value="nome">Nome A-Z</option>
              <option value="sku">SKU A-Z</option>
              <option value="recentes">Mais recentes</option>
            </select>

            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: corPrimaria }}
            >
              Buscar
            </button>

            {hasFilters && (
              <Link
                href={`/catalogo/${slug}`}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/5"
              >
                Limpar
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div
        className="min-h-screen"
        style={{ background: corFundo }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar filters */}
            {(allTags.length > 0 || Object.keys(attrUniqueValues).length > 0) && (
              <aside className="hidden w-52 shrink-0 lg:block">
                <div className="sticky top-32 space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <SlidersHorizontal size={14} />
                    Filtros
                  </div>

                  {/* Tag filter */}
                  {allTags.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={buildFilterUrl(slug, sp, "tag", "")}
                          className="rounded-full px-3 py-1 text-xs font-medium transition"
                          style={
                            !tagFilter
                              ? { background: corPrimaria, color: "#fff" }
                              : { background: `${corPrimaria}22`, color: corPrimaria }
                          }
                        >
                          Todas
                        </Link>
                        {allTags.map((t) => (
                          <Link
                            key={t}
                            href={buildFilterUrl(slug, sp, "tag", t)}
                            className="rounded-full px-3 py-1 text-xs font-medium transition"
                            style={
                              tagFilter === t
                                ? { background: corPrimaria, color: "#fff" }
                                : { background: `${corPrimaria}22`, color: corPrimaria }
                            }
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attribute filters */}
                  {Object.entries(attrUniqueValues).map(([attrIdStr, vals]) => {
                    const attrId = Number(attrIdStr);
                    const attr = catalogAttributes.find((a) => a.id === attrId);
                    if (!attr) return null;
                    const currentVal = sp[`attr_${attrId}`] ?? "";
                    return (
                      <div key={attrId}>
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                          {attr.nome}
                          {attr.unidade ? ` (${attr.unidade})` : ""}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            href={buildFilterUrl(slug, sp, `attr_${attrId}`, "")}
                            className="rounded-full px-3 py-1 text-xs font-medium transition"
                            style={
                              !currentVal
                                ? { background: corPrimaria, color: "#fff" }
                                : { background: `${corPrimaria}22`, color: corPrimaria }
                            }
                          >
                            Todos
                          </Link>
                          {vals.map((v) => (
                            <Link
                              key={v}
                              href={buildFilterUrl(slug, sp, `attr_${attrId}`, v)}
                              className="rounded-full px-3 py-1 text-xs font-medium transition"
                              style={
                                currentVal === v
                                  ? { background: corPrimaria, color: "#fff" }
                                  : { background: `${corPrimaria}22`, color: corPrimaria }
                              }
                            >
                              {v}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            )}

            {/* Product grid */}
            <div className="min-w-0 flex-1">
              <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                {items.length} produto{items.length !== 1 ? "s" : ""}
                {hasFilters ? " encontrado" + (items.length !== 1 ? "s" : "") : ""}
              </p>
              <ProductGrid
                products={items}
                catalogAttributes={catalogAttributes}
                accentColor={corPrimaria}
                cardStyle={cardStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildFilterUrl(
  slug: string,
  currentSp: SearchParamsShape,
  key: string,
  value: string
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(currentSp)) {
    if (v && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/catalogo/${slug}${qs ? `?${qs}` : ""}`;
}
