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

// ---------- Constants ----------

const DEFAULT_PRIMARY = "#7c3aed";
const DEFAULT_SECONDARY = "#2563eb";
const TEXT_DARK = "#18181b";
const TEXT_MID = "#52525b";
const TEXT_LIGHT = "#a1a1aa";
const BG_PAGE = "#f8f7fc";
const BG_CARD = "#ffffff";
const BORDER_COLOR = "#e4e4e7";

// ---------- Helpers ----------

function getPrimaryImage(images: PdfProductImage[]): PdfProductImage | null {
  return images.find((i) => i.isPrimary) ?? images[0] ?? null;
}

function getThemeColors(theme?: PdfCatalogTheme | null) {
  return {
    primary: theme?.corPrimaria ?? DEFAULT_PRIMARY,
    secondary: theme?.corSecundaria ?? DEFAULT_SECONDARY,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function fmtAttr(valor: string, unidade?: string | null) {
  return unidade ? `${valor} ${unidade}` : valor;
}

// ---------- Decorative background: Cover ----------

function CoverBackground({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      {/* Full solid background */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: primary }} />

      {/* Large circle top-right (secondary, partial) */}
      <View style={{
        position: "absolute", top: -130, right: -100,
        width: 380, height: 380, borderRadius: 190,
        backgroundColor: secondary, opacity: 0.35,
      }} />

      {/* Medium circle bottom-left */}
      <View style={{
        position: "absolute", bottom: -100, left: -80,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: "#ffffff", opacity: 0.07,
      }} />

      {/* Small accent circle mid */}
      <View style={{
        position: "absolute", top: "45%", right: 50,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: "#ffffff", opacity: 0.1,
      }} />

      {/* Top accent stripe */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        backgroundColor: secondary,
      }} />

      {/* Bottom accent stripe */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
        backgroundColor: secondary,
      }} />

      {/* Dot grid simulation — horizontal rule mid */}
      <View style={{
        position: "absolute", top: "38%", left: 36, right: 36, height: 1,
        backgroundColor: "#ffffff", opacity: 0.1,
      }} />
      <View style={{
        position: "absolute", top: "62%", left: 36, right: 36, height: 1,
        backgroundColor: "#ffffff", opacity: 0.08,
      }} />
    </>
  );
}

// ---------- Cover Page ----------

function CatalogCoverPage({
  title,
  nomeLoja,
  logoDataUri,
  primary,
  secondary,
  imagemCapa,
}: {
  title: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  primary: string;
  secondary: string;
  imagemCapa?: string | null;
}) {
  return (
    <Page size="A4" style={{ padding: 0 }}>
      <CoverBackground primary={primary} secondary={secondary} />

      {imagemCapa && (
        <Image
          src={imagemCapa}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15 }}
        />
      )}

      {/* Main content — centered */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 60, paddingVertical: 80 }}>
        {/* Logo container */}
        {logoDataUri && (
          <View style={{
            width: 90, height: 90, borderRadius: 20,
            backgroundColor: "#ffffff",
            alignItems: "center", justifyContent: "center",
            marginBottom: 28,
            padding: 8,
          }}>
            <Image src={logoDataUri} style={{ width: 74, height: 74, objectFit: "contain" }} />
          </View>
        )}

        {/* Title */}
        <Text style={{
          fontSize: 34, fontWeight: 700, color: "#ffffff",
          textAlign: "center", lineHeight: 1.25,
        }}>
          {title}
        </Text>

        {/* Thick divider bar */}
        <View style={{
          width: 56, height: 4, borderRadius: 2,
          backgroundColor: secondary, marginVertical: 22,
        }} />

        {/* Subtitle */}
        {nomeLoja && nomeLoja !== title && (
          <Text style={{
            fontSize: 13, color: "rgba(255,255,255,0.65)",
            textAlign: "center", lineHeight: 1.5,
          }}>
            {nomeLoja}
          </Text>
        )}

        {/* Year pill */}
        <View style={{
          marginTop: 36,
          paddingHorizontal: 22, paddingVertical: 9,
          borderRadius: 30,
          borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
        }}>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 2 }}>
            {`CATÁLOGO  ·  ${new Date().getFullYear()}`}
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ---------- Section Cover ----------

function CatalogSectionCover({
  nome,
  descricao,
  primary,
  secondary,
  imagemCapaSecao,
}: {
  nome: string;
  descricao?: string | null;
  primary: string;
  secondary: string;
  imagemCapaSecao?: string | null;
}) {
  return (
    <Page size="A4" style={{ padding: 0 }}>
      {/* Top 65% — primary band */}
      <View style={{ height: "65%", backgroundColor: primary, position: "relative", overflow: "hidden" }}>
        {imagemCapaSecao && (
          <Image
            src={imagemCapaSecao}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18 }}
          />
        )}

        {/* Decorative circle */}
        <View style={{
          position: "absolute", top: -80, right: -60,
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: secondary, opacity: 0.3,
        }} />
        <View style={{
          position: "absolute", bottom: -60, left: -40,
          width: 180, height: 180, borderRadius: 90,
          backgroundColor: "#ffffff", opacity: 0.06,
        }} />

        {/* Section label */}
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 52 }}>
          <View style={{
            width: 40, height: 3, borderRadius: 2,
            backgroundColor: secondary, marginBottom: 16,
          }} />
          <Text style={{
            fontSize: 28, fontWeight: 700, color: "#ffffff",
            lineHeight: 1.25,
          }}>
            {nome}
          </Text>
          {descricao && (
            <Text style={{
              fontSize: 11, color: "rgba(255,255,255,0.7)",
              marginTop: 12, lineHeight: 1.6, maxWidth: 340,
            }}>
              {descricao}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom 35% — white / light */}
      <View style={{
        flex: 1, backgroundColor: BG_PAGE,
        alignItems: "flex-start", justifyContent: "center",
        paddingHorizontal: 52,
      }}>
        <View style={{ width: 28, height: 4, borderRadius: 2, backgroundColor: primary, marginBottom: 12 }} />
        <Text style={{ fontSize: 10, color: TEXT_LIGHT, letterSpacing: 1 }}>
          PRODUTOS DO CATÁLOGO
        </Text>
      </View>

      {/* Top stripe */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, backgroundColor: secondary }} />
    </Page>
  );
}

// ---------- Header / Footer ----------

function PDFHeader({
  nomeLoja,
  primary,
  secondary,
  cabecalhoTexto,
  logoDataUri,
  exibirCabecalho,
}: {
  nomeLoja?: string;
  primary: string;
  secondary: string;
  cabecalhoTexto?: string | null;
  logoDataUri?: string | null;
  exibirCabecalho: boolean;
}) {
  if (!exibirCabecalho) return null;
  return (
    <View fixed style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 36,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 32,
      backgroundColor: BG_CARD,
      borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {logoDataUri && (
          <View style={{
            width: 22, height: 22, borderRadius: 5, marginRight: 7,
            backgroundColor: "#f4f4f5",
            alignItems: "center", justifyContent: "center",
          }}>
            <Image src={logoDataUri} style={{ width: 16, height: 16, objectFit: "contain" }} />
          </View>
        )}
        <Text style={{ fontSize: 8, fontWeight: 700, color: primary, letterSpacing: 0.5 }}>
          {cabecalhoTexto ?? nomeLoja ?? "Catálogo"}
        </Text>
      </View>
      {/* Right accent dot */}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: secondary }} />
    </View>
  );
}

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
    <View fixed style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 30,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 32,
      backgroundColor: BG_CARD,
      borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    }}>
      <Text style={{ fontSize: 7.5, color: TEXT_LIGHT }}>
        {rodapeTexto ?? nomeLoja ?? "Catálogo de Produtos"}
      </Text>
      <Text
        style={{ fontSize: 7.5, color: primary, fontWeight: 700 }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

// ---------- Product Page — 1 per page ----------

function ProductPageSingle({
  product,
  primary,
  secondary,
  nomeLoja,
  logoDataUri,
  cabecalhoTexto,
  rodapeTexto,
  exibirCabecalho,
  exibirRodape,
}: {
  product: PdfProduct;
  primary: string;
  secondary: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
}) {
  const primaryImage = getPrimaryImage(product.images);
  const topPad = exibirCabecalho ? 48 : 0;
  const botPad = exibirRodape ? 42 : 0;

  const specs: [string, string][] = ([
    product.material ? ["Material", product.material] : null,
    product.cor ? ["Cor", product.cor] : null,
    product.dimensoes ? ["Dimensões", product.dimensoes] : null,
    product.peso ? ["Peso", product.peso] : null,
    product.tamanhoMin ? ["Tam. mín.", product.tamanhoMin] : null,
    product.tamanhoMax ? ["Tam. máx.", product.tamanhoMax] : null,
  ].filter(Boolean)) as [string, string][];

  return (
    <Page size="A4" style={{ padding: 0, backgroundColor: BG_PAGE }}>
      <PDFHeader
        nomeLoja={nomeLoja} primary={primary} secondary={secondary}
        cabecalhoTexto={cabecalhoTexto} logoDataUri={logoDataUri}
        exibirCabecalho={exibirCabecalho}
      />
      <PDFFooter
        nomeLoja={nomeLoja} rodapeTexto={rodapeTexto}
        primary={primary} exibirRodape={exibirRodape}
      />

      {/* Colored product name banner */}
      <View style={{
        position: "absolute", top: topPad, left: 0, right: 0,
        backgroundColor: primary, paddingVertical: 18, paddingHorizontal: 36,
        flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        {/* Decorative top-right circle */}
        <View style={{
          position: "absolute", top: -20, right: -20,
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: secondary, opacity: 0.4,
        }} />

        <View style={{ flex: 1, paddingRight: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
            {product.nome}
          </Text>
          {product.sku && (
            <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              SKU {product.sku}
            </Text>
          )}
        </View>

        {/* Tag count badge */}
        {product.tags.length > 0 && (
          <View style={{
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}>
            <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.85)" }}>
              {product.tags.length} tag{product.tags.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Page body */}
      <View style={{
        position: "absolute",
        top: topPad + 66,
        bottom: botPad,
        left: 0, right: 0,
        flexDirection: "row",
        padding: 24, gap: 20,
      }}>
        {/* Left — image */}
        <View style={{ width: "40%", flexDirection: "column", gap: 8 }}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              style={{
                width: "100%", height: 190,
                borderRadius: 10, objectFit: "contain",
                backgroundColor: BG_CARD,
                borderWidth: 1, borderColor: BORDER_COLOR,
              }}
            />
          ) : (
            <View style={{
              width: "100%", height: 190, borderRadius: 10,
              backgroundColor: BG_CARD, borderWidth: 1, borderColor: BORDER_COLOR,
              alignItems: "center", justifyContent: "center",
            }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: BORDER_COLOR, marginBottom: 8,
              }} />
              <Text style={{ fontSize: 8, color: TEXT_LIGHT }}>Sem imagem</Text>
            </View>
          )}

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {product.images.slice(0, 5).map((img, i) => (
                <Image
                  key={i}
                  src={img.url}
                  style={{
                    width: 36, height: 36, borderRadius: 6, objectFit: "cover",
                    borderWidth: 1, borderColor: BORDER_COLOR,
                  }}
                />
              ))}
            </View>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {product.tags.map((t, i) => (
                <View key={i} style={{
                  paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
                  backgroundColor: primary + "22",
                }}>
                  <Text style={{ fontSize: 7, color: primary, fontWeight: 700 }}>{t.tag.nome}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right — info */}
        <View style={{ flex: 1 }}>
          {/* Description */}
          {product.descricao && (
            <View style={{
              backgroundColor: BG_CARD, borderRadius: 8, padding: 12,
              borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 12,
            }}>
              <Text style={{ fontSize: 7.5, color: TEXT_MID, fontWeight: 700, marginBottom: 5, letterSpacing: 0.5 }}>
                DESCRIÇÃO
              </Text>
              <Text style={{ fontSize: 9, color: TEXT_DARK, lineHeight: 1.6 }}>
                {product.descricao}
              </Text>
            </View>
          )}

          {/* Specs */}
          {(specs.length > 0 || product.attributeValues.length > 0) && (
            <View style={{
              backgroundColor: BG_CARD, borderRadius: 8,
              borderWidth: 1, borderColor: BORDER_COLOR, overflow: "hidden",
              marginBottom: 12,
            }}>
              {/* Header */}
              <View style={{ backgroundColor: primary + "12", paddingHorizontal: 12, paddingVertical: 7 }}>
                <Text style={{ fontSize: 7.5, color: primary, fontWeight: 700, letterSpacing: 0.5 }}>
                  ESPECIFICAÇÕES
                </Text>
              </View>

              {/* Spec rows */}
              {[...specs, ...product.attributeValues.map((av) => [
                av.attribute.nome + (av.attribute.unidade ? ` (${av.attribute.unidade})` : ""),
                av.valor,
              ] as [string, string])].map(([label, value], i) => (
                <View key={i} style={{
                  flexDirection: "row", justifyContent: "space-between",
                  paddingHorizontal: 12, paddingVertical: 6,
                  backgroundColor: i % 2 === 0 ? BG_CARD : BG_PAGE,
                }}>
                  <Text style={{ fontSize: 8.5, color: TEXT_MID }}>{label}</Text>
                  <Text style={{ fontSize: 8.5, color: TEXT_DARK, fontWeight: 700 }}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Observações */}
          {product.observacoes && (
            <View style={{
              backgroundColor: secondary + "0f", borderRadius: 8, padding: 10,
              borderWidth: 1, borderColor: secondary + "30",
            }}>
              <Text style={{ fontSize: 7.5, color: secondary, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>
                OBSERVAÇÕES
              </Text>
              <Text style={{ fontSize: 8.5, color: TEXT_DARK, lineHeight: 1.5 }}>
                {product.observacoes}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom left accent bar */}
      <View style={{
        position: "absolute", left: 0, top: topPad + 66, bottom: botPad,
        width: 4, backgroundColor: primary, borderRadius: 2,
      }} />
    </Page>
  );
}

// ---------- Mini Card (2-per-page) ----------

function ProductMiniCard({ product, primary, secondary }: {
  product: PdfProduct;
  primary: string;
  secondary: string;
}) {
  const primaryImage = getPrimaryImage(product.images);

  return (
    <View style={{
      flex: 1,
      backgroundColor: BG_CARD,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 1, borderColor: BORDER_COLOR,
    }}>
      {/* Colored name header */}
      <View style={{
        backgroundColor: primary, paddingHorizontal: 12, paddingVertical: 10,
        position: "relative", overflow: "hidden",
      }}>
        {/* Deco circle */}
        <View style={{
          position: "absolute", top: -16, right: -16,
          width: 50, height: 50, borderRadius: 25,
          backgroundColor: secondary, opacity: 0.4,
        }} />
        <Text style={{
          fontSize: 10, fontWeight: 700, color: "#ffffff",
          lineHeight: 1.2,
        }}>
          {product.nome}
        </Text>
        {product.sku && (
          <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            SKU {product.sku}
          </Text>
        )}
      </View>

      {/* Image */}
      {primaryImage ? (
        <Image
          src={primaryImage.url}
          style={{ width: "100%", height: 140, objectFit: "cover" }}
        />
      ) : (
        <View style={{
          width: "100%", height: 140,
          backgroundColor: BG_PAGE,
          alignItems: "center", justifyContent: "center",
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: BORDER_COLOR, marginBottom: 6,
          }} />
          <Text style={{ fontSize: 7, color: TEXT_LIGHT }}>Sem imagem</Text>
        </View>
      )}

      {/* Body */}
      <View style={{ padding: 10 }}>
        {/* Description */}
        {product.descricao && (
          <Text style={{ fontSize: 8, color: TEXT_MID, lineHeight: 1.4, marginBottom: 7 }}>
            {product.descricao}
          </Text>
        )}

        {/* Specs */}
        {product.attributeValues.slice(0, 4).map((av, i) => (
          <View key={i} style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingVertical: 4,
            borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
          }}>
            <Text style={{ fontSize: 7.5, color: TEXT_MID }}>{av.attribute.nome}</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_DARK, fontWeight: 700 }}>
              {fmtAttr(av.valor, av.attribute.unidade)}
            </Text>
          </View>
        ))}

        {/* Tags */}
        {product.tags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
            {product.tags.slice(0, 4).map((t, i) => (
              <View key={i} style={{
                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
                backgroundColor: primary + "22",
              }}>
                <Text style={{ fontSize: 6.5, color: primary }}>{t.tag.nome}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ---------- Product Page — 2 per page ----------

function ProductPageDouble({
  products,
  primary,
  secondary,
  nomeLoja,
  logoDataUri,
  cabecalhoTexto,
  rodapeTexto,
  exibirCabecalho,
  exibirRodape,
}: {
  products: [PdfProduct, PdfProduct?];
  primary: string;
  secondary: string;
  nomeLoja?: string;
  logoDataUri?: string | null;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
}) {
  const [p1, p2] = products;
  const topPad = exibirCabecalho ? 48 : 24;
  const botPad = exibirRodape ? 42 : 24;

  return (
    <Page size="A4" style={{ padding: 0, backgroundColor: BG_PAGE }}>
      <PDFHeader
        nomeLoja={nomeLoja} primary={primary} secondary={secondary}
        cabecalhoTexto={cabecalhoTexto} logoDataUri={logoDataUri}
        exibirCabecalho={exibirCabecalho}
      />
      <PDFFooter
        nomeLoja={nomeLoja} rodapeTexto={rodapeTexto}
        primary={primary} exibirRodape={exibirRodape}
      />

      <View style={{
        flexDirection: "row", gap: 14,
        paddingTop: topPad + 14, paddingBottom: botPad + 14,
        paddingHorizontal: 24,
      }}>
        <ProductMiniCard product={p1} primary={primary} secondary={secondary} />
        {p2 ? (
          <ProductMiniCard product={p2} primary={primary} secondary={secondary} />
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </Page>
  );
}

// ---------- Main document ----------

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
        secondary={coverColors.secondary}
        imagemCapa={firstTheme?.imagemCapa ?? undefined}
      />

      {sections.map((section) => {
        const theme = section.catalog.pdfTheme;
        const { primary, secondary } = getThemeColors(theme);
        const produtosPorPagina = theme?.produtosPorPagina ?? 2;
        const exibirCabecalho = theme?.exibirCabecalho ?? true;
        const exibirRodape = theme?.exibirRodape ?? true;

        const sharedProps = {
          nomeLoja,
          logoDataUri,
          primary,
          secondary,
          cabecalhoTexto: theme?.cabecalhoTexto ?? null,
          rodapeTexto: theme?.rodapeTexto ?? null,
          exibirCabecalho,
          exibirRodape,
        };

        return (
          <React.Fragment key={section.catalog.id}>
            {(isGeral || sections.length > 1) && (
              <CatalogSectionCover
                nome={section.catalog.nome}
                descricao={section.catalog.descricao}
                primary={primary}
                secondary={secondary}
                imagemCapaSecao={theme?.imagemCapaSecao ?? undefined}
              />
            )}

            {produtosPorPagina === 1
              ? section.products.map((product) => (
                  <ProductPageSingle key={product.id} product={product} {...sharedProps} />
                ))
              : chunk(section.products, 2).map((group, i) => (
                  <ProductPageDouble
                    key={i}
                    products={group as [PdfProduct, PdfProduct?]}
                    {...sharedProps}
                  />
                ))}
          </React.Fragment>
        );
      })}
    </Document>
  );
}
