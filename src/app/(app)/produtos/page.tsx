import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { PRODUCT_STATUS_COLOR, PRODUCT_STATUS_LABEL } from "@/lib/status";
import { getItemEditorRefs } from "@/lib/item-refs";
import { NovoProdutoButton } from "./novo-produto-button";
import { ProductRowActions } from "./product-row-actions";
import { EmptyState } from "@/components/empty-state";
import { isModelo3DVisualizavel } from "@/lib/model-utils";
import { Box, ImageOff } from "lucide-react";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; status?: string }>;
}) {
  const { q, categoria, status } = await searchParams;

  const refs = await getItemEditorRefs();

  const categorias = await db.product
    .findMany({ select: { categoria: true }, distinct: ["categoria"] })
    .then((rows) => rows.map((r) => r.categoria).filter((c): c is string => Boolean(c)));

  const products = await db.product.findMany({
    where: {
      AND: [
        q ? { nome: { contains: q } } : {},
        categoria ? { categoria } : {},
        status ? { status: status as "ATIVO" | "INATIVO" } : {},
      ],
    },
    include: {
      attachments: { select: { id: true, nomeArquivo: true, caminho: true } },
      materiaisExtras: { select: { id: true, inventoryItemId: true, pesoG: true } },
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Produtos</h1>
        <NovoProdutoButton refs={refs} />
      </div>

      <form className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" method="get">
        <Input name="q" placeholder="Buscar por nome..." defaultValue={q ?? ""} />
        <Select name="categoria" defaultValue={categoria ?? ""}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </Select>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col card p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                {product.fotoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/uploads/${encodeURIComponent(product.fotoPath)}`}
                    alt={product.nome}
                    className="h-14 w-14 shrink-0 rounded-lg border border-[var(--surface-border)] object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
                    <ImageOff size={20} />
                  </div>
                )}
                <div>
                  <p className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-white">
                    {product.nome}
                    {product.attachments.some((a) => isModelo3DVisualizavel(a.nomeArquivo)) && (
                      <Box size={14} className="text-[var(--accent)]" aria-label="Tem modelo 3D anexado" />
                    )}
                  </p>
                  {product.categoria && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{product.categoria}</p>
                  )}
                </div>
              </div>
              <Badge color={PRODUCT_STATUS_COLOR[product.status]}>{PRODUCT_STATUS_LABEL[product.status]}</Badge>
            </div>

            {product.descricao && (
              <p className="mb-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">{product.descricao}</p>
            )}

            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Custo médio</p>
                <p className="text-neutral-900 dark:text-white">
                  {product.custoMedio != null ? formatCurrency(product.custoMedio) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Preço sugerido</p>
                <p className="text-neutral-900 dark:text-white">
                  {product.precoSugerido != null ? formatCurrency(product.precoSugerido) : "-"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <ProductRowActions product={product} refs={refs} />
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="Nenhum produto encontrado." />
          </div>
        )}
      </div>
    </div>
  );
}
