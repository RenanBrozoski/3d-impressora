import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { CatalogDocument, type PdfCatalogSection, type PdfProduct } from "@/lib/pdf/catalog-document";

// Helper: build PdfProduct from a raw Prisma item with its includes
function buildPdfProduct(item: {
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
  images: { url: string; altText?: string | null; isPrimary: boolean; ordem: number }[];
  tags: { tag: { nome: string } }[];
  attributeValues: { attribute: { nome: string; unidade?: string | null }; valor: string }[];
}): PdfProduct {
  return {
    id: item.id,
    nome: item.nome,
    sku: item.sku,
    descricao: item.descricao,
    material: item.material,
    cor: item.cor,
    dimensoes: item.dimensoes,
    peso: item.peso,
    tamanhoMin: item.tamanhoMin,
    tamanhoMax: item.tamanhoMax,
    observacoes: item.observacoes,
    images: item.images,
    tags: item.tags,
    attributeValues: item.attributeValues,
  };
}

const productInclude = {
  images: { orderBy: [{ isPrimary: "desc" as const }, { ordem: "asc" as const }] },
  tags: { include: { tag: true } },
  attributeValues: { include: { attribute: true } },
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const catalogId = url.searchParams.get("catalogId");
    const type = url.searchParams.get("type");
    const itemIdsParam = url.searchParams.get("itemIds");
    const customTitle = url.searchParams.get("title");

    const settings = await db.settings.findUnique({ where: { id: 1 } });
    const nomeLoja = settings?.nomeLoja ?? "Impressão 3D";

    // Try to fetch logo as data URI
    let logoDataUri: string | null = null;
    if (settings?.logoPath) {
      try {
        const logoResponse = await fetch(
          `${url.protocol}//${url.host}/api/logo`
        );
        if (logoResponse.ok) {
          const buffer = await logoResponse.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const ct = logoResponse.headers.get("content-type") ?? "image/png";
          logoDataUri = `data:${ct};base64,${base64}`;
        }
      } catch {
        // Logo fetch failed, proceed without it
      }
    }

    let sections: PdfCatalogSection[] = [];
    let docTitle = customTitle ?? "Catálogo";
    let isGeral = false;

    if (catalogId) {
      // ---- Single catalog PDF ----
      const catalog = await db.catalog.findUnique({
        where: { id: Number(catalogId) },
        include: {
          pdfTheme: true,
          products: {
            where: { item: { ativo: true, deletedAt: null } },
            include: {
              item: {
                include: productInclude,
              },
            },
            orderBy: { ordem: "asc" },
          },
        },
      });

      if (!catalog) {
        return new Response("Catálogo não encontrado", { status: 404 });
      }

      docTitle = customTitle ?? catalog.nome;
      sections = [
        {
          catalog: {
            id: catalog.id,
            nome: catalog.nome,
            descricao: catalog.descricao,
            icone: catalog.icone,
            pdfTheme: catalog.pdfTheme,
          },
          products: catalog.products.map((rel) => buildPdfProduct(rel.item)),
        },
      ];
    } else if (type === "geral") {
      // ---- All catalogs PDF ----
      isGeral = true;
      docTitle = customTitle ?? `Catálogo Geral — ${nomeLoja}`;

      const catalogs = await db.catalog.findMany({
        where: { ativo: true, deletedAt: null, tipo: "catalogo" },
        orderBy: { ordem: "asc" },
        include: {
          pdfTheme: true,
          products: {
            where: { item: { ativo: true, deletedAt: null } },
            include: {
              item: {
                include: productInclude,
              },
            },
            orderBy: { ordem: "asc" },
          },
        },
      });

      sections = catalogs.map((catalog) => ({
        catalog: {
          id: catalog.id,
          nome: catalog.nome,
          descricao: catalog.descricao,
          icone: catalog.icone,
          pdfTheme: catalog.pdfTheme,
        },
        products: catalog.products.map((rel) => buildPdfProduct(rel.item)),
      }));
    } else if (itemIdsParam) {
      // ---- Manual selection PDF ----
      const itemIds = itemIdsParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      if (itemIds.length === 0) {
        return new Response("Nenhum produto selecionado", { status: 400 });
      }

      docTitle = customTitle ?? "Seleção de Produtos";

      const items = await db.catalogItem.findMany({
        where: { id: { in: itemIds }, ativo: true, deletedAt: null },
        include: productInclude,
      });

      // Preserve order from request
      const ordered = itemIds
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as typeof items;

      sections = [
        {
          catalog: {
            id: 0,
            nome: docTitle,
            pdfTheme: null,
          },
          products: ordered.map(buildPdfProduct),
        },
      ];
    } else {
      return new Response(
        "Parâmetro obrigatório ausente: catalogId, type=geral ou itemIds",
        { status: 400 }
      );
    }

    if (sections.length === 0 || sections.every((s) => s.products.length === 0)) {
      return new Response("Nenhum produto para gerar o PDF", { status: 404 });
    }

    const pdfBuffer = await renderToBuffer(
      <CatalogDocument
        sections={sections}
        title={docTitle}
        isGeral={isGeral}
        nomeLoja={nomeLoja}
        logoDataUri={logoDataUri}
      />
    );

    const safeTitle = docTitle.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_").slice(0, 60);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[PDF] Erro ao gerar catálogo:", error);
    return new Response("Erro interno ao gerar o PDF", { status: 500 });
  }
}
