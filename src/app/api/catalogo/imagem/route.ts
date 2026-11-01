import { db } from "@/lib/db";
import { isPrivateBlobUrl } from "@/lib/catalog-image";

// Public (no session) on purpose: the catalog is customer-facing. Only URLs
// registered as catalog item/theme images are served, so other private blobs
// (order attachments, client requests) stay inaccessible.
async function isCatalogImage(url: string): Promise<boolean> {
  const [img, theme, pdfTheme] = await Promise.all([
    db.catalogItemImage.findFirst({ where: { url }, select: { id: true } }),
    db.catalogTheme.findFirst({
      where: { OR: [{ imagemCapa: url }, { imagemFundo: url }, { logoUrl: url }, { imagemDeco: url }] },
      select: { id: true },
    }),
    db.catalogPdfTheme.findFirst({
      where: {
        OR: [
          { imagemCapa: url },
          { imagemCapaSecao: url },
          { imagemFundo: url },
          { logoUrl: url },
          { imagemDeco: url },
        ],
      },
      select: { id: true },
    }),
  ]);
  return !!(img || theme || pdfTheme);
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("u");
  if (!url || !isPrivateBlobUrl(url) || !(await isCatalogImage(url))) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // Blob URLs carry a random suffix, so the content behind a URL never changes.
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
