"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/input";
import { addItemToCatalog, removeItemFromCatalog } from "@/app/actions/catalog-items";

interface CatalogRel {
  catalogId: number;
  catalog: {
    id: number;
    nome: string;
    slug: string;
    attributes: {
      attributeId: number;
      attribute: {
        id: number;
        nome: string;
        tipo: string;
        opcoes: string[] | null;
        unidade: string | null;
      };
    }[];
  };
}

interface AttributeValue {
  attributeId: number;
  valor: string;
  attribute: {
    nome: string;
    tipo: string;
    opcoes: string[] | null;
    unidade: string | null;
  };
}

interface AvailableCatalog {
  id: number;
  nome: string;
}

interface ProductCatalogsTabProps {
  itemId: number;
  catalogRels: CatalogRel[];
  availableCatalogs: AvailableCatalog[];
  attributeValues: AttributeValue[];
}

export function ProductCatalogsTab({
  itemId,
  catalogRels,
  availableCatalogs,
  attributeValues,
}: ProductCatalogsTabProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedCatalog, setSelectedCatalog] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  function handleAdd() {
    if (!selectedCatalog) return;
    startTransition(async () => {
      const result = await addItemToCatalog(itemId, Number(selectedCatalog));
      if (result?.erro) alert(result.erro);
      else {
        setSelectedCatalog("");
        router.refresh();
      }
    });
  }

  function handleRemove(catalogId: number) {
    setRemovingId(catalogId);
    startTransition(async () => {
      await removeItemFromCatalog(itemId, catalogId);
      setRemovingId(null);
      router.refresh();
    });
  }

  const attrValueMap = new Map(attributeValues.map((v) => [v.attributeId, v]));

  return (
    <div className="space-y-6">
      {/* Adicionar ao catálogo */}
      {availableCatalogs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Adicionar a um catálogo
          </p>
          <div className="flex gap-2">
            <Select
              value={selectedCatalog}
              onChange={(e) => setSelectedCatalog(e.target.value)}
              className="flex-1"
              disabled={pending}
            >
              <option value="">Selecionar catálogo...</option>
              {availableCatalogs.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAdd}
              disabled={!selectedCatalog || pending}
            >
              <Plus size={15} />
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Catálogos em que o produto está */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Catálogos deste produto ({catalogRels.length})
        </p>

        {catalogRels.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Este produto não está em nenhum catálogo.
          </p>
        ) : (
          <div className="space-y-4">
            {catalogRels.map((rel) => (
              <div key={rel.catalogId} className="card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {rel.catalog.nome}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-500">/{rel.catalog.slug}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover do catálogo"
                      disabled={pending && removingId === rel.catalogId}
                      onClick={() => handleRemove(rel.catalogId)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>

                {/* Atributos deste catálogo */}
                {rel.catalog.attributes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Atributos do catálogo
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {rel.catalog.attributes.map(({ attribute, attributeId }) => {
                        const existing = attrValueMap.get(attributeId);
                        return (
                          <div key={attributeId} className="text-sm">
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                              {attribute.nome}
                              {attribute.unidade && (
                                <span className="ml-1 font-normal text-neutral-400">({attribute.unidade})</span>
                              )}
                              :
                            </span>{" "}
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {existing?.valor || <em className="text-neutral-400">não preenchido</em>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-neutral-400">
                      Para editar os valores, use a aba &quot;Dados&quot;.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
