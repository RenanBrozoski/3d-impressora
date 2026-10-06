"use client";

import { useState } from "react";
import { X, ImageOff, Tag } from "lucide-react";
import { ImageGallery } from "@/components/catalog/image-gallery";

function colorIsDark(hex: string): boolean {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

function lightenHex(hex: string, amount: number): string {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return hex;
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
}

export interface ProductAttributeValue {
  attribute: { id: number; nome: string; unidade?: string | null };
  valor: string;
}

export interface ProductTag {
  tag: { nome: string };
}

export interface ProductItem {
  id: number;
  nome: string;
  sku?: string | null;
  descricao?: string | null;
  material?: string | null;
  cor?: string | null;
  dimensoes?: string | null;
  peso?: string | null;
  tamanhoMin?: string | null;
  tamanhoMax?: string | null;
  observacoes?: string | null;
  images: ProductImage[];
  tags: ProductTag[];
  attributeValues: ProductAttributeValue[];
}

export interface CatalogAttributeForDisplay {
  id: number;
  nome: string;
  unidade?: string | null;
}

interface Props {
  products: ProductItem[];
  catalogAttributes: CatalogAttributeForDisplay[];
  accentColor?: string;
  cardStyle?: string;
  bgColor?: string;
}

function formatAttributeValue(valor: string, unidade?: string | null) {
  if (!valor) return "-";
  return unidade ? `${valor} ${unidade}` : valor;
}

function getAttributeValue(item: ProductItem, attrId: number) {
  const av = item.attributeValues.find((v) => v.attribute.id === attrId);
  return av ? formatAttributeValue(av.valor, av.attribute.unidade) : null;
}

function ProductModal({
  product,
  catalogAttributes,
  onClose,
}: {
  product: ProductItem;
  catalogAttributes: CatalogAttributeForDisplay[];
  onClose: () => void;
}) {
  const primaryImages = product.images.sort((a, b) =>
    a.isPrimary === b.isPrimary ? a.id - b.id : a.isPrimary ? -1 : 1
  );

  const specs = [
    product.material && { label: "Material", value: product.material },
    product.cor && { label: "Cor", value: product.cor },
    product.dimensoes && { label: "Dimensões", value: product.dimensoes },
    product.peso && { label: "Peso", value: product.peso },
    product.tamanhoMin && { label: "Tamanho mínimo", value: product.tamanhoMin },
    product.tamanhoMax && { label: "Tamanho máximo", value: product.tamanhoMax },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card relative w-full max-w-3xl max-h-[90vh] overflow-y-auto !bg-[var(--surface-solid)] p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {product.nome}
            </h2>
            {product.sku && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                SKU: {product.sku}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Images */}
          <div>
            {primaryImages.length > 0 ? (
              <ImageGallery images={primaryImages} />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl border border-[var(--surface-border)] bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
                <ImageOff size={48} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {product.descricao && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Descrição
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {product.descricao}
                </p>
              </div>
            )}

            {/* Catalog attributes */}
            {catalogAttributes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Atributos
                </p>
                <div className="space-y-1.5">
                  {catalogAttributes.map((attr) => {
                    const val = getAttributeValue(product, attr.id);
                    if (!val) return null;
                    return (
                      <div key={attr.id} className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {attr.nome}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specs */}
            {specs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Especificações
                </p>
                <div className="space-y-1.5">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.observacoes && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Observações
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {product.observacoes}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((t) => (
                    <span
                      key={t.tag.nome}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--surface-border)] px-2.5 py-0.5 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      <Tag size={10} />
                      {t.tag.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  catalogAttributes,
  accentColor,
  cardStyle,
  bgColor,
  onClick,
}: {
  product: ProductItem;
  catalogAttributes: CatalogAttributeForDisplay[];
  accentColor: string;
  cardStyle: string;
  bgColor: string;
  onClick: () => void;
}) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const previewAttrs = catalogAttributes.slice(0, 3);
  const initial = product.nome.charAt(0).toUpperCase();
  const [imgError, setImgError] = useState(false);

  const dark = colorIsDark(bgColor);
  const cardBg = dark ? lightenHex(bgColor, 28) : "#ffffff";
  const textMain = dark ? "#f9fafb" : "#111827";
  const textSub = dark ? "#a1a1aa" : "#6b7280";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  const baseStyle = { background: cardBg, borderColor: borderCol };
  const cardClass =
    cardStyle === "outlined"
      ? "rounded-xl border-2"
      : "rounded-xl border shadow-sm";

  return (
    <div
      className={`group flex flex-col overflow-hidden ${cardClass} cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl`}
      style={
        cardStyle === "outlined"
          ? { ...baseStyle, borderColor: accentColor }
          : baseStyle
      }
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Accent top bar */}
      <div className="h-1.5 w-full shrink-0" style={{ background: accentColor }} />

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {primaryImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center"
            style={{ background: `${accentColor}14` }}
          >
            <span
              className="text-6xl font-bold"
              style={{ color: accentColor, opacity: 0.35 }}
            >
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold line-clamp-2" style={{ color: textMain }}>
          {product.nome}
        </h3>
        {product.sku && (
          <p className="mt-0.5 text-xs" style={{ color: textSub }}>
            SKU: {product.sku}
          </p>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((t) => (
              <span
                key={t.tag.nome}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: `${accentColor}22`, color: accentColor }}
              >
                {t.tag.nome}
              </span>
            ))}
          </div>
        )}

        {/* Preview attributes */}
        {previewAttrs.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {previewAttrs.map((attr) => {
              const val = getAttributeValue(product, attr.id);
              if (!val) return null;
              return (
                <div key={attr.id} className="flex justify-between text-xs">
                  <span style={{ color: textSub }}>{attr.nome}</span>
                  <span className="font-semibold" style={{ color: textMain }}>{val}</span>
                </div>
              );
            })}
          </div>
        )}

        <button
          className="mt-auto pt-4 text-left text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
          style={{ color: accentColor }}
          onClick={onClick}
        >
          Ver detalhes →
        </button>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  catalogAttributes,
  accentColor = "#7c3aed",
  cardStyle = "rounded",
  bgColor = "#f8f7fc",
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500 dark:text-neutral-400">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            catalogAttributes={catalogAttributes}
            accentColor={accentColor}
            cardStyle={cardStyle}
            bgColor={bgColor}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          catalogAttributes={catalogAttributes}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
