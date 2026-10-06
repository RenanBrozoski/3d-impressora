"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CheckCircle2 } from "lucide-react";
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
type ErpProduct = {
  id: number;
  nome: string;
  descricao: string | null;
  materialRecomendado: string | null;
  categoria: string | null;
  fotoPath: string | null;
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
  erpProducts?: ErpProduct[];
}

export function CatalogItemForm({ item, catalogs, attributes, erpProducts }: CatalogItemFormProps) {
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

  // Controlled fields (used for import)
  const [nome, setNome] = useState(item?.nome ?? "");
  const [descricao, setDescricao] = useState(item?.descricao ?? "");
  const [material, setMaterial] = useState(item?.material ?? "");
  const [erpFotoPath, setErpFotoPath] = useState("");

  // ERP combobox state
  const [erpSearch, setErpSearch] = useState("");
  const [erpDropdownOpen, setErpDropdownOpen] = useState(false);
  const [selectedErpNome, setSelectedErpNome] = useState("");
  const erpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (erpRef.current && !erpRef.current.contains(e.target as Node)) {
        setErpDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredErpProducts = erpProducts
    ? erpProducts.filter((p) => {
        const q = erpSearch.toLowerCase();
        return (
          p.nome.toLowerCase().includes(q) ||
          (p.categoria ?? "").toLowerCase().includes(q)
        );
      })
    : [];

  function importFromErp(productId: string) {
    const product = erpProducts?.find((p) => String(p.id) === productId);
    if (!product) return;
    setNome(product.nome);
    setDescricao(product.descricao ?? "");
    setMaterial(product.materialRecomendado ?? "");
    setErpFotoPath(product.fotoPath ?? "");
  }

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
      {erpFotoPath && <input type="hidden" name="erpFotoPath" value={erpFotoPath} />}

      {/* Importar de produto existente */}
      {!isEditing && erpProducts && erpProducts.length > 0 && (
        <section className="card border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
          <h2 className="mb-1 text-sm font-semibold text-[var(--accent)]">
            Importar de produto existente
          </h2>
          <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
            Busque um produto do ERP para preencher os campos automaticamente.
          </p>

          <div ref={erpRef} className="relative">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou categoria..."
                value={erpSearch}
                onChange={(e) => {
                  setErpSearch(e.target.value);
                  setErpDropdownOpen(true);
                  if (selectedErpNome) setSelectedErpNome("");
                }}
                onFocus={() => setErpDropdownOpen(true)}
                className="w-full rounded-lg border border-[var(--accent)]/30 bg-white/80 py-2.5 pl-9 pr-8 text-sm text-neutral-900 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 dark:bg-white/5 dark:text-white"
              />
              {erpSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setErpSearch("");
                    setSelectedErpNome("");
                    setErpFotoPath("");
                    setErpDropdownOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {erpDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[var(--surface-border)] bg-white shadow-xl dark:bg-neutral-900">
                {filteredErpProducts.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-neutral-500">Nenhum produto encontrado.</p>
                ) : (
                  filteredErpProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-white/5"
                      onClick={() => {
                        setErpSearch(p.nome);
                        setSelectedErpNome(p.nome);
                        setErpDropdownOpen(false);
                        importFromErp(String(p.id));
                      }}
                    >
                      {p.fotoPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.fotoPath}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {p.nome}
                        </p>
                        {p.categoria && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {p.categoria}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Confirmation banner */}
          {selectedErpNome && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-900/20">
              {erpFotoPath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={erpFotoPath}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.removeChild(
                      e.target as HTMLImageElement
                    );
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {selectedErpNome}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Campos preenchidos automaticamente
                  {erpFotoPath ? " · imagem importada" : ""}
                </p>
              </div>
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            </div>
          )}
        </section>
      )}

      {/* Dados básicos */}
      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Dados básicos
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" name="nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do produto" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={item?.sku ?? ""} placeholder="Ex: PROD-001" />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" name="descricao" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição detalhada do produto..." />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" name="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Ex: PLA" />
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
