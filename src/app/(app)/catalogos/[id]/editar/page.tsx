import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CatalogForm } from "../../catalog-form";

export default async function EditarCatalogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const catalog = await db.catalog.findUnique({
    where: { id: Number(id), deletedAt: null },
    select: {
      id: true,
      nome: true,
      slug: true,
      descricao: true,
      icone: true,
      ativo: true,
      tipo: true,
      ordem: true,
    },
  });

  if (!catalog) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/catalogos/${id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft size={14} />
          {catalog.nome}
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Editar catálogo
        </h1>
      </div>

      <div className="card p-6">
        <CatalogForm catalog={catalog} />
      </div>
    </div>
  );
}
