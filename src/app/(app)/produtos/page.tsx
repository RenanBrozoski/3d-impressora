import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { PRODUCT_STATUS_COLOR, PRODUCT_STATUS_LABEL } from "@/lib/status";
import { NovoProdutoButton } from "./novo-produto-button";
import { ProductRowActions } from "./product-row-actions";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; status?: string }>;
}) {
  const { q, categoria, status } = await searchParams;

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
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Produtos</h1>
        <NovoProdutoButton />
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
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{product.nome}</p>
                {product.categoria && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{product.categoria}</p>
                )}
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
              <ProductRowActions product={product} />
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <p className="col-span-full py-8 text-center text-neutral-500 dark:text-neutral-400">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
