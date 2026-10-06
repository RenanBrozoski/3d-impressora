import Link from "next/link";
import { db } from "@/lib/db";
import { Package } from "lucide-react";

export default async function CatalogoPage() {
  const catalogs = await db.catalog.findMany({
    where: { ativo: true, deletedAt: null, tipo: "catalogo" },
    orderBy: { ordem: "asc" },
    include: {
      theme: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          Nossos Catálogos
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          Explore nossa coleção de produtos impressos em 3D
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((catalog) => {
          const cor1 = catalog.theme?.corPrimaria ?? "#7c3aed";
          const cor2 = catalog.theme?.corSecundaria ?? "#2563eb";
          const corTexto = catalog.theme?.corTexto ?? "#ffffff";
          const imagemCapa = catalog.theme?.imagemCapa;

          return (
            <Link
              key={catalog.id}
              href={`/catalogo/${catalog.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-[var(--surface-border)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ minHeight: 280 }}
            >
              {/* Background */}
              {imagemCapa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagemCapa}
                  alt={catalog.nome}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${cor1}, ${cor2})` }}
                />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: imagemCapa
                    ? `linear-gradient(to top, ${cor1}ee, ${cor1}99 50%, transparent)`
                    : `linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.1))`,
                }}
              />

              {/* Content */}
              <div
                className="relative flex flex-col items-center justify-center p-8 text-center"
                style={{ minHeight: 280 }}
              >
                {catalog.icone && (
                  <span className="mb-3 text-5xl drop-shadow-lg">{catalog.icone}</span>
                )}
                <h2
                  className="text-2xl font-bold drop-shadow-md"
                  style={{ color: corTexto }}
                >
                  {catalog.nome}
                </h2>
                {catalog.descricao && (
                  <p
                    className="mt-2 line-clamp-2 text-sm opacity-90 drop-shadow"
                    style={{ color: corTexto }}
                  >
                    {catalog.descricao}
                  </p>
                )}
                <div
                  className="mt-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ background: "rgba(0,0,0,0.3)", color: corTexto }}
                >
                  <Package size={12} />
                  {catalog._count.products} produto
                  {catalog._count.products !== 1 ? "s" : ""}
                </div>

                {/* Hover indicator */}
                <div
                  className="mt-4 translate-y-2 text-xs font-medium opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ color: corTexto }}
                >
                  Ver catálogo →
                </div>
              </div>
            </Link>
          );
        })}

        {catalogs.length === 0 && (
          <div className="col-span-full py-20 text-center text-neutral-500 dark:text-neutral-400">
            Nenhum catálogo disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
