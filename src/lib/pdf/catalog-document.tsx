import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// ---------- Types ----------

export interface PdfCatalogTheme {
  corPrimaria: string;
  corSecundaria: string;
  corTexto?: string | null;
  corFundo?: string | null;
  imagemCapa?: string | null;
  imagemCapaSecao?: string | null;
  logoUrl?: string | null;
  produtosPorPagina: number;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
}

export interface PdfProductImage {
  url: string;
  altText?: string | null;
  isPrimary: boolean;
}

export interface PdfProductAttributeValue {
  attribute: { nome: string; unidade?: string | null };
  valor: string;
}

export interface PdfProductTag {
  tag: { nome: string };
}

export interface PdfProduct {
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
  images: PdfProductImage[];
  tags: PdfProductTag[];
  attributeValues: PdfProductAttributeValue[];
}

export interface PdfCatalogSection {
  catalog: {
    id: number;
    nome: string;
    descricao?: string | null;
    icone?: string | null;
    pdfTheme?: PdfCatalogTheme | null;
  };
  products: PdfProduct[];
}

export interface CatalogDocumentProps {
  sections: PdfCatalogSection[];
  title?: string;
  isGeral?: boolean;
  nomeLoja?: string;
  logoDataUri?: string | null;
}

// ---------- Default colors ----------

const DEFAULT_PRIMARY = "#7c3aed";
const DEFAULT_SECONDARY = "#2563eb";
const DEFAULT_TEXT = "#14121f";
const DEFAULT_BG = "#ffffff";
const TEXT_GRAY = "#71717a";
const BORDER = "#e4e4e7";
const BG_SOFT = "#faf9fc";

// ---------- Helpers ----------

function fmtAttrValue(valor: string, unidade?: string | null) {
  return unidade ? `${valor} ${unidade}` : valor;
}

function getPrimaryImage(images: PdfProductImage[]): PdfProductImage | null {
  return images.find((i) => i.isPrimary) ?? images[0] ?? null;
}

function getThemeColors(theme?: PdfCatalogTheme | null) {
  return {
    primary: theme?.corPrimaria ?? DEFAULT_PRIMARY,
    secondary: theme?.corSecundaria ?? DEFAULT_SECONDARY,
    text: theme?.corTexto ?? "#ffffff",
    bg: theme?.corFundo ?? DEFAULT_BG,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ---------- Shared styles ----------

const shared = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DEFAULT_TEXT,
    backgroundColor: DEFAULT_BG,
  },
  labelSmall: {
    fontSize: 7.5,
    fontWeight: 700,
    color: TEXT_GRAY,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginVertical: 8,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  specLabel: { fontSize: 8.5, color: TEXT_GRAY },
  specValue: { fontSize: 8.5, color: DEFAULT_TEXT, fontWeight: 700 },
});

// ---------- PDFHeader ----------

function PDFHeader({
  nomeLoja,
  primary,
  cabecalhoTexto,
  logoDataUri,
  exibirCabecalho,
}: {
  nomeLoja?: string;
  primary: string;
  cabecalhoTexto?: string | null;
  logoDataUri?: string | null;
  exibirCabecalho: boolean;
}) {
  if (!exibirCabecalho) return null;
  return (
    <View
      fixed
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 36,
        backgroundColor: BG_SOFT,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {logoDataUri && (
          <Image
            src={logoDataUri}
            style={{ width: 16, height: 16, borderRadius: 3, marginRight: 6 }}
          />
        )}
        <Text style={{ fontSize: 8, fontWeight: 700, color: primary }}>
          {cabecalhoTexto ?? nomeLoja ?? "Catálogo"}
        </Text>
      </View>
    </View>
  );
}

// ---------- PDFFooter ----------

function PDFFooter({
  nomeLoja,
  rodapeTexto,
  primary,
  exibirRodape,
}: {
  nomeLoja?: string;
  rodapeTexto?: string | null;
  primary: string;
  exibirRodape: boolean;
}) {
  if (!exibirRodape) return null;
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 36,
        backgroundColor: BG_SOFT,
        borderTopWidth: 1,
        borderTopColor: BORDER,
      }}
    >
      <Text style={{ fontSize: 7.5, color: TEXT_GRAY }}>
        {rodapeTexto ?? nomeLoja ?? "Catálogo de Produtos"}
      </Text>
      <Text
        style={{ fontSize: 7.5, color: primary }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

// ---------- CatalogCoverPage ----------

function CatalogCoverPage({
  title,
  nomeLoja,
  logoDataUri,
  primary,
  imagemCapa,
}: {
  title: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  primary: string;
  imagemCapa?: string | null;
}) {
  return (
    <Page size="A4" style={[shared.page, { padding: 0 }]}>
      {/* Color band */}
      <View
        style={{
          height: "50%",
          backgroundColor: primary,
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        {imagemCapa && (
          <Image
            src={imagemCapa}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0.25,
            }}
          />
        )}
        <View style={{ alignItems: "center" }}>
          {logoDataUri && (
            <Image
              src={logoDataUri}
              style={{ width: 60, height: 60, borderRadius: 10, marginBottom: 14 }}
            />
          )}
          <Text
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          {nomeLoja && nomeLoja !== title && (
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {nomeLoja}
            </Text>
          )}
        </View>
      </View>

      {/* Lower area */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG_SOFT,
          padding: 40,
        }}
      >
        <View
          style={{
            width: 48,
            height: 4,
            backgroundColor: primary,
            borderRadius: 2,
            marginBottom: 18,
          }}
        />
        <Text
          style={{
            fontSize: 11,
            color: TEXT_GRAY,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Catálogo de produtos · {new Date().getFullYear()}
        </Text>
      </View>
    </Page>
  );
}

// ---------- CatalogSectionCover ----------

function CatalogSectionCover({
  nome,
  descricao,
  primary,
  imagemCapaSecao,
}: {
  nome: string;
  descricao?: string | null;
  primary: string;
  imagemCapaSecao?: string | null;
}) {
  return (
    <Page size="A4" style={[shared.page, { padding: 0 }]}>
      <View
        style={{
          flex: 1,
          backgroundColor: primary,
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
        }}
      >
        {imagemCapaSecao && (
          <Image
            src={imagemCapaSecao}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0.2,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {nome}
        </Text>
        {descricao && (
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.8)",
              marginTop: 12,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {descricao}
          </Text>
        )}
      </View>
    </Page>
  );
}

// ---------- Product layout 1 per page ----------

function ProductPageSingle({
  product,
  primary,
  nomeLoja,
  logoDataUri,
  cabecalhoTexto,
  rodapeTexto,
  exibirCabecalho,
  exibirRodape,
}: {
  product: PdfProduct;
  primary: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
}) {
  const primaryImage = getPrimaryImage(product.images);
  const topPad = exibirCabecalho ? 44 : 24;
  const botPad = exibirRodape ? 40 : 24;

  const specs: [string, string][] = [
    product.material ? ["Material", product.material] : null,
    product.cor ? ["Cor", product.cor] : null,
    product.dimensoes ? ["Dimensões", product.dimensoes] : null,
    product.peso ? ["Peso", product.peso] : null,
    product.tamanhoMin ? ["Tam. mínimo", product.tamanhoMin] : null,
    product.tamanhoMax ? ["Tam. máximo", product.tamanhoMax] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <Page
      size="A4"
      style={[
        shared.page,
        {
          paddingTop: topPad,
          paddingBottom: botPad,
          paddingHorizontal: 36,
        },
      ]}
    >
      <PDFHeader
        nomeLoja={nomeLoja}
        primary={primary}
        cabecalhoTexto={cabecalhoTexto}
        logoDataUri={logoDataUri}
        exibirCabecalho={exibirCabecalho}
      />
      <PDFFooter
        nomeLoja={nomeLoja}
        rodapeTexto={rodapeTexto}
        primary={primary}
        exibirRodape={exibirRodape}
      />

      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Left column — image(s) */}
        <View style={{ width: "42%", paddingRight: 20 }}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
                objectFit: "contain",
                backgroundColor: BG_SOFT,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
                backgroundColor: BG_SOFT,
                borderWidth: 1,
                borderColor: BORDER,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: TEXT_GRAY, fontSize: 8 }}>Sem imagem</Text>
            </View>
          )}

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}
            >
              {product.images.slice(0, 5).map((img, i) => (
                <Image
                  key={i}
                  src={img.url}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 4,
                    objectFit: "cover",
                    marginRight: 4,
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: BORDER,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Right column — info */}
        <View style={{ flex: 1 }}>
          {/* Name & SKU */}
          <View style={{ marginBottom: 6 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: DEFAULT_TEXT,
                lineHeight: 1.3,
              }}
            >
              {product.nome}
            </Text>
            {product.sku && (
              <Text style={{ fontSize: 8.5, color: TEXT_GRAY, marginTop: 2 }}>
                SKU: {product.sku}
              </Text>
            )}
          </View>

          <View style={shared.divider} />

          {/* Description */}
          {product.descricao && (
            <View style={{ marginBottom: 10 }}>
              <Text style={shared.labelSmall}>Descrição</Text>
              <Text
                style={{ fontSize: 9, color: DEFAULT_TEXT, lineHeight: 1.5 }}
              >
                {product.descricao}
              </Text>
            </View>
          )}

          {/* Attributes */}
          {product.attributeValues.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={shared.labelSmall}>Atributos</Text>
              {product.attributeValues.map((av, i) => (
                <View key={i} style={shared.specRow}>
                  <Text style={shared.specLabel}>{av.attribute.nome}</Text>
                  <Text style={shared.specValue}>
                    {fmtAttrValue(av.valor, av.attribute.unidade)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={shared.labelSmall}>Especificações</Text>
              {specs.map(([label, value], i) => (
                <View key={i} style={shared.specRow}>
                  <Text style={shared.specLabel}>{label}</Text>
                  <Text style={shared.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Observações */}
          {product.observacoes && (
            <View style={{ marginBottom: 10 }}>
              <Text style={shared.labelSmall}>Observações</Text>
              <Text style={{ fontSize: 8.5, color: TEXT_GRAY, lineHeight: 1.4 }}>
                {product.observacoes}
              </Text>
            </View>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {product.tags.map((t, i) => (
                <View
                  key={i}
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: primary,
                    marginRight: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 7, color: primary }}>{t.tag.nome}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}

// ---------- Mini card used in 2-per-page layout ----------

function ProductMiniCard({
  product,
  primary,
}: {
  product: PdfProduct;
  primary: string;
}) {
  const primaryImage = getPrimaryImage(product.images);

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {primaryImage ? (
        <Image
          src={primaryImage.url}
          style={{ width: "100%", height: 155, objectFit: "cover" }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 155,
            backgroundColor: BG_SOFT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 7.5, color: TEXT_GRAY }}>Sem imagem</Text>
        </View>
      )}

      <View style={{ padding: 10 }}>
        {/* Name + SKU */}
        <View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: DEFAULT_TEXT,
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            {product.nome}
          </Text>
          {product.sku && (
            <Text style={{ fontSize: 7.5, color: TEXT_GRAY, marginBottom: 6 }}>
              SKU: {product.sku}
            </Text>
          )}
        </View>

        {/* Description */}
        {product.descricao && (
          <Text
            style={{
              fontSize: 8,
              color: DEFAULT_TEXT,
              lineHeight: 1.4,
              marginBottom: 6,
            }}
          >
            {product.descricao}
          </Text>
        )}

        {/* Attributes */}
        {product.attributeValues.slice(0, 4).map((av, i) => (
          <View key={i} style={shared.specRow}>
            <Text style={[shared.specLabel, { fontSize: 7.5 }]}>
              {av.attribute.nome}
            </Text>
            <Text style={[shared.specValue, { fontSize: 7.5 }]}>
              {fmtAttrValue(av.valor, av.attribute.unidade)}
            </Text>
          </View>
        ))}

        {/* Tags */}
        {product.tags.length > 0 && (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}
          >
            {product.tags.slice(0, 4).map((t, i) => (
              <View
                key={i}
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 1.5,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: primary,
                  marginRight: 3,
                  marginBottom: 3,
                }}
              >
                <Text style={{ fontSize: 6, color: primary }}>{t.tag.nome}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ---------- Product layout 2 per page ----------

function ProductPageDouble({
  products,
  primary,
  nomeLoja,
  logoDataUri,
  cabecalhoTexto,
  rodapeTexto,
  exibirCabecalho,
  exibirRodape,
}: {
  products: [PdfProduct, PdfProduct?];
  primary: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
}) {
  const [p1, p2] = products;
  const topPad = exibirCabecalho ? 44 : 24;
  const botPad = exibirRodape ? 40 : 24;

  return (
    <Page
      size="A4"
      style={[
        shared.page,
        { paddingTop: topPad, paddingBottom: botPad, paddingHorizontal: 36 },
      ]}
    >
      <PDFHeader
        nomeLoja={nomeLoja}
        primary={primary}
        cabecalhoTexto={cabecalhoTexto}
        logoDataUri={logoDataUri}
        exibirCabecalho={exibirCabecalho}
      />
      <PDFFooter
        nomeLoja={nomeLoja}
        rodapeTexto={rodapeTexto}
        primary={primary}
        exibirRodape={exibirRodape}
      />

      <View style={{ flexDirection: "row", flex: 1 }}>
        <ProductMiniCard product={p1} primary={primary} />
        {p2 ? (
          <>
            <View style={{ width: 14 }} />
            <ProductMiniCard product={p2} primary={primary} />
          </>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </Page>
  );
}

// ---------- Main CatalogDocument ----------

export function CatalogDocument({
  sections,
  title,
  isGeral = false,
  nomeLoja,
  logoDataUri,
}: CatalogDocumentProps) {
  const docTitle = title ?? nomeLoja ?? "Catálogo de Produtos";
  const firstTheme = sections[0]?.catalog.pdfTheme;
  const coverColors = getThemeColors(firstTheme);

  return (
    <Document title={docTitle}>
      {/* Global cover */}
      <CatalogCoverPage
        title={docTitle}
        nomeLoja={nomeLoja}
        logoDataUri={logoDataUri}
        primary={coverColors.primary}
        imagemCapa={firstTheme?.imagemCapa ?? undefined}
      />

      {sections.map((section) => {
        const theme = section.catalog.pdfTheme;
        const colors = getThemeColors(theme);
        const produtosPorPagina = theme?.produtosPorPagina ?? 2;
        const exibirCabecalho = theme?.exibirCabecalho ?? true;
        const exibirRodape = theme?.exibirRodape ?? true;

        const headerProps = {
          nomeLoja,
          logoDataUri,
          primary: colors.primary,
          cabecalhoTexto: theme?.cabecalhoTexto ?? null,
          rodapeTexto: theme?.rodapeTexto ?? null,
          exibirCabecalho,
          exibirRodape,
        };

        return (
          // React.Fragment with key — Page elements must be direct children of Document
          <React.Fragment key={section.catalog.id}>
            {/* Section cover for multi-section PDFs */}
            {(isGeral || sections.length > 1) && (
              <CatalogSectionCover
                nome={section.catalog.nome}
                descricao={section.catalog.descricao}
                primary={colors.primary}
                imagemCapaSecao={theme?.imagemCapaSecao ?? undefined}
              />
            )}

            {/* Product pages */}
            {produtosPorPagina === 1
              ? section.products.map((product) => (
                  <ProductPageSingle
                    key={product.id}
                    product={product}
                    {...headerProps}
                  />
                ))
              : chunk(section.products, 2).map((group, i) => (
                  <ProductPageDouble
                    key={i}
                    products={group as [PdfProduct, PdfProduct?]}
                    {...headerProps}
                  />
                ))}
          </React.Fragment>
        );
      })}
    </Document>
  );
}
