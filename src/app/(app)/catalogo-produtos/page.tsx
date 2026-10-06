import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { CatalogItemActions } from "./catalog-item-actions";
import { Plus, ImageOff } from "lucide-react";

export default async function CatalogoProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; catalogId?: string; status?: string }>;
}) {
  const { q, catalogId, status } = await searchParams;

  const [items, catalogs] = await Promise.all([
    db.catalogItem.findMany({
      where: {
        deletedAt: null,
        AND: [
          q
            ? {
                OR: [
                  { nome: { contains: q } },
                  { sku: { contains: q } },
                ],
              }
            : {},
          catalogId
            ? { catalogs: { some: { catalogId: Number(catalogId) } } }
            : {},
          status === "ativo"
            ? { ativo: true }
            : status === "inativo"
            ? { ativo: false }
            : {},
        ],
      },
      orderBy: [{ nome: "asc" }],
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        catalogs: {
          include: { catalog: { select: { id: true, nome: true } } },
        },
      },
    }),
    db.catalog.findMany({
      where: { deletedAt: null },
      select: { id: true, nome: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Produtos do catálogo
        </h1>
        <Link href="/catalogo-produtos/novo">
          <Button>
            <Plus size={16} />
            Novo produto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <form className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" method="get">
        <Input name="q" placeholder="Buscar por nome ou SKU..." defaultValue={q ?? ""} />
        <Select name="catalogId" defaultValue={catalogId ?? ""}>
          <option value="">Todos os catálogos</option>
          {catalogs.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
      </form>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const coverUrl = item.images[0]?.url;
          return (
            <div key={item.id} className="card flex flex-col p-4">
              <div className="mb-3 flex items-start gap-3">
                {/* Thumbnail */}
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={item.nome}
                    className="h-14 w-14 shrink-0 rounded-lg border border-[var(--surface-border)] object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
                    <ImageOff size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/catalogo-produtos/${item.id}`}
                    className="block truncate font-medium text-neutral-900 hover:underline dark:text-white"
                  >
                    {item.nome}
                  </Link>
                  {item.sku && (
                    <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {item.sku}
                    </p>
                  )}
                </div>

                <Badge color={item.ativo ? "green" : "neutral"}>
                  {item.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {/* Catálogos */}
              {item.catalogs.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.catalogs.map((rel) => (
                    <span
                      key={rel.catalogId}
                      className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]"
                    >
                      {rel.catalog.nome}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-2">
                <CatalogItemActions
                  itemId={item.id}
                  nome={item.nome}
                  ativo={item.ativo}
                />
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="Nenhum produto encontrado." />
          </div>
        )}
      </div>
    </div>
  );
}
