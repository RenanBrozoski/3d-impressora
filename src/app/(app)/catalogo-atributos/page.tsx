export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Layers } from "lucide-react";
import { AttributeRow } from "./attribute-row";
import { AttributeForm } from "./attribute-form";

export default async function CatalogoAtributosPage() {
  const attributes = await db.catalogAttribute.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: {
          catalogs: true,
          values: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Atributos globais
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Atributos são compartilhados entre catálogos. Crie aqui e vincule a cada catálogo que precisar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lista */}
        <div className="lg:col-span-2">
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {attributes.length} atributo{attributes.length !== 1 ? "s" : ""} cadastrado{attributes.length !== 1 ? "s" : ""}
          </p>

          {attributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] py-16 text-center">
              <Layers size={32} className="mb-3 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Nenhum atributo cadastrado ainda
              </p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Crie atributos no formulário ao lado e vincule-os aos catálogos
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {attributes.map((attr) => (
                <AttributeRow
                  key={attr.id}
                  attr={{ ...attr, opcoes: (attr.opcoes as string[] | null) }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Formulário de criação */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
            Novo atributo
          </h2>
          <AttributeForm />
        </div>
      </div>
    </div>
  );
}
