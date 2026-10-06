"use client";

import { useState } from "react";
import { FileDown, Package, List, BookOpen, type LucideIcon } from "lucide-react";

export interface CatalogForPdf {
  id: number;
  nome: string;
  slug: string;
  icone?: string | null;
  productCount: number;
}

export interface ProductForPdf {
  id: number;
  nome: string;
  sku?: string | null;
  catalogNames: string[];
}

type Mode = "catalogo" | "geral" | "manual";

interface Props {
  catalogs: CatalogForPdf[];
  products: ProductForPdf[];
}

export function PdfGenerator({ catalogs, products }: Props) {
  const [mode, setMode] = useState<Mode>("catalogo");
  const [selectedCatalogId, setSelectedCatalogId] = useState<number | "">("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [pdfTitle, setPdfTitle] = useState("");

  function toggleProduct(id: number) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p.id)));
    }
  }

  const manualPdfUrl =
    selectedProductIds.size > 0
      ? `/api/catalogo/pdf?itemIds=${Array.from(selectedProductIds).join(",")}&title=${encodeURIComponent(pdfTitle || "Seleção de Produtos")}`
      : null;

  const catalogPdfUrl = selectedCatalogId
    ? `/api/catalogo/pdf?catalogId=${selectedCatalogId}`
    : null;

  const geralPdfUrl = `/api/catalogo/pdf?type=geral`;

  const totalProducts = catalogs.reduce((acc, c) => acc + c.productCount, 0);

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-2 border-b border-[var(--surface-border)]">
        {(
          [
            { id: "catalogo", label: "Por catálogo", icon: BookOpen },
            { id: "geral", label: "Geral completo", icon: FileDown },
            { id: "manual", label: "Seleção manual", icon: List },
          ] as { id: Mode; label: string; icon: LucideIcon }[]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              mode === id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Mode: Por catálogo */}
      {mode === "catalogo" && (
        <div className="card space-y-5 p-6">
          <h2 className="font-semibold text-neutral-900 dark:text-white">
            Selecione o catálogo
          </h2>

          {catalogs.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum catálogo ativo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalogs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatalogId(cat.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    selectedCatalogId === cat.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--surface-border)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <div className="text-2xl">{cat.icone ?? "📦"}</div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{cat.nome}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {cat.productCount} produto{cat.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {catalogPdfUrl ? (
            <a
              href={catalogPdfUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              <FileDown size={16} />
              Gerar PDF do catálogo selecionado
            </a>
          ) : (
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
            >
              <FileDown size={16} />
              Selecione um catálogo acima
            </button>
          )}
        </div>
      )}

      {/* Mode: Geral */}
      {mode === "geral" && (
        <div className="card space-y-5 p-6">
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-white">
              PDF Geral — todos os catálogos
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Gera um PDF completo com todos os catálogos ativos e seus produtos, incluindo capa
              e páginas de seção para cada catálogo.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <Package size={20} className="text-[var(--accent)]" />
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {catalogs.length} catálogo{catalogs.length !== 1 ? "s" : ""} ·{" "}
              {totalProducts} produto{totalProducts !== 1 ? "s" : ""} no total
            </p>
          </div>

          <a
            href={geralPdfUrl}
            download
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <FileDown size={16} />
            Gerar PDF Completo
          </a>
        </div>
      )}

      {/* Mode: Manual selection */}
      {mode === "manual" && (
        <div className="space-y-4">
          <div className="card space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-neutral-900 dark:text-white">
                Selecionar produtos
              </h2>
              {products.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {selectedProductIds.size === products.length
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum produto encontrado.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-lg border border-[var(--surface-border)]">
                {products.map((product, i) => (
                  <label
                    key={product.id}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--accent)]/5 ${
                      i > 0 ? "border-t border-[var(--surface-border)]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="h-4 w-4 rounded border-neutral-300 accent-[var(--accent)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-neutral-900 dark:text-white">
                        {product.nome}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {product.sku ? `SKU: ${product.sku}` : ""}
                        {product.sku && product.catalogNames.length > 0 ? " · " : ""}
                        {product.catalogNames.join(", ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* PDF config */}
          <div className="card space-y-4 p-6">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Configurar PDF</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nome do PDF (opcional)
              </label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Ex: Produtos para Cliente X"
                className="glow-ring w-full max-w-sm rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>

            {manualPdfUrl ? (
              <a
                href={manualPdfUrl}
                download
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                <FileDown size={16} />
                Gerar PDF Selecionado ({selectedProductIds.size} produto
                {selectedProductIds.size !== 1 ? "s" : ""})
              </a>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              >
                <FileDown size={16} />
                Selecione produtos acima
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
