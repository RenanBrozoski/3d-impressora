"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createCatalogItem, updateCatalogItem } from "@/app/actions/catalog-items";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";

type CatalogOption = { id: number; nome: string };
type Attribute = {
  id: number;
  nome: string;
  tipo: string;
  opcoes: string[] | null;
  unidade: string | null;
};

type ItemData = {
  id: number;
  nome: string;
  sku: string | null;
  descricao: string | null;
  tamanhoMin: string | null;
  tamanhoMax: string | null;
  dimensoes: string | null;
  material: string | null;
  cor: string | null;
  peso: string | null;
  observacoes: string | null;
  ativo: boolean;
  ordemGlobal: number;
  catalogIds: number[];
  tags: string[];
  attributeValues: Record<string, string>;
};

interface CatalogItemFormProps {
  item?: ItemData;
  catalogs: CatalogOption[];
  attributes: Attribute[];
}

export function CatalogItemForm({ item, catalogs, attributes }: CatalogItemFormProps) {
  const router = useRouter();
  const isEditing = !!item;

  const action = isEditing
    ? updateCatalogItem.bind(null, item.id)
    : createCatalogItem;

  const [state, formAction, pending] = useActionState(action, undefined);
  const [ativo, setAtivo] = useState(item?.ativo ?? true);
  const [selectedCatalogs, setSelectedCatalogs] = useState<number[]>(item?.catalogIds ?? []);
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [attrValues, setAttrValues] = useState<Record<string, string>>(item?.attributeValues ?? {});

  // Get attributes for the selected catalogs
  // (attributes are already pre-filtered by parent, or show all)

  useEffect(() => {
    if (state?.sucesso) {
      router.push("/catalogo-produtos");
    }
  }, [state, router]);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function toggleCatalog(id: number) {
    setSelectedCatalogs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields for JSON data */}
      <input type="hidden" name="catalogIds" value={JSON.stringify(selectedCatalogs)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
      <input type="hidden" name="attributeValues" value={JSON.stringify(attrValues)} />
      <input type="hidden" name="ativo" value={ativo ? "true" : "false"} />

      {/* Dados básicos */}
      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Dados básicos
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" name="nome" required defaultValue={item?.nome} placeholder="Nome do produto" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={item?.sku ?? ""} placeholder="Ex: PROD-001" />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" name="descricao" rows={4} defaultValue={item?.descricao ?? ""} placeholder="Descrição detalhada do produto..." />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" name="material" defaultValue={item?.material ?? ""} placeholder="Ex: PLA" />
          </div>
          <div>
            <Label htmlFor="cor">Cor</Label>
            <Input id="cor" name="cor" defaultValue={item?.cor ?? ""} placeholder="Ex: Preto" />
          </div>
          <div>
            <Label htmlFor="peso">Peso</Label>
            <Input id="peso" name="peso" defaultValue={item?.peso ?? ""} placeholder="Ex: 120g" />
          </div>
          <div>
            <Label htmlFor="dimensoes">Dimensões</Label>
            <Input id="dimensoes" name="dimensoes" defaultValue={item?.dimensoes ?? ""} placeholder="Ex: 10x5x3cm" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="tamanhoMin">Tamanho mínimo</Label>
            <Input id="tamanhoMin" name="tamanhoMin" defaultValue={item?.tamanhoMin ?? ""} placeholder="Ex: P" />
          </div>
          <div>
            <Label htmlFor="tamanhoMax">Tamanho máximo</Label>
            <Input id="tamanhoMax" name="tamanhoMax" defaultValue={item?.tamanhoMax ?? ""} placeholder="Ex: GG" />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="observacoes">Observações internas</Label>
          <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={item?.observacoes ?? ""} />
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={ativo}
            onClick={() => setAtivo((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              ativo ? "bg-[var(--accent)]" : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                ativo ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {ativo ? "Produto ativo" : "Produto inativo"}
          </span>
        </div>
      </section>

      {/* Catálogos */}
      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Catálogos
        </h2>
        {catalogs.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum catálogo disponível.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {catalogs.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--surface-border)] p-3 hover:bg-[var(--accent)]/5">
                <input
                  type="checkbox"
                  checked={selectedCatalogs.includes(cat.id)}
                  onChange={() => toggleCatalog(cat.id)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{cat.nome}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Tags */}
      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tags</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-sm text-[var(--accent)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--accent)]/20"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Nenhuma tag adicionada.</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Digite uma tag e pressione Enter..."
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Adicionar
          </Button>
        </div>
      </section>

      {/* Atributos personalizados */}
      {attributes.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Atributos personalizados
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attributes.map((attr) => {
              const value = attrValues[String(attr.id)] ?? "";
              const onChange = (v: string) =>
                setAttrValues((prev) => ({ ...prev, [String(attr.id)]: v }));

              return (
                <div key={attr.id}>
                  <Label>
                    {attr.nome}
                    {attr.unidade && (
                      <span className="ml-1 font-normal text-neutral-400">({attr.unidade})</span>
                    )}
                  </Label>
                  {attr.tipo === "select" && attr.opcoes ? (
                    <select
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="glow-ring w-full rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none transition-all focus:border-[var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">Selecionar...</option>
                      {attr.opcoes.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : attr.tipo === "boolean" ? (
                    <select
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="glow-ring w-full rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none transition-all focus:border-[var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">-</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  ) : (
                    <Input
                      type={attr.tipo === "number" ? "number" : "text"}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={attr.tipo === "number" ? "0" : ""}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <FieldError message={state?.erro} />

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/catalogo-produtos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
