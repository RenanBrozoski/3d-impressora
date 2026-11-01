import "server-only";
import sharp from "sharp";
import { isPrivateBlobUrl } from "@/lib/catalog-image";
import type { PdfCatalogSection } from "@/lib/pdf/catalog-document";

const MAX_WIDTH = 900;
const CONCURRENCY = 6;

// react-pdf can't send auth headers (the Blob store is private) and only
// decodes JPEG/PNG, so every image is fetched here and embedded as JPEG.
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: isPrivateBlobUrl(url)
        ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        : undefined,
    });
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(input)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

async function convertAll(urls: string[]): Promise<Map<string, string | null>> {
  const unique = [...new Set(urls)];
  const out = new Map<string, string | null>();
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(toDataUri));
    batch.forEach((u, j) => out.set(u, results[j]));
  }
  return out;
}

const THEME_IMAGE_KEYS = ["imagemCapa", "imagemCapaSecao", "logoUrl"] as const;

// Images that fail to load are dropped so the "Sem imagem" placeholder renders
// instead of react-pdf aborting the whole document.
export async function embedCatalogImages(sections: PdfCatalogSection[]): Promise<PdfCatalogSection[]> {
  const urls: string[] = [];
  for (const s of sections) {
    for (const p of s.products) for (const img of p.images) urls.push(img.url);
    const theme = s.catalog.pdfTheme;
    if (theme) for (const k of THEME_IMAGE_KEYS) if (theme[k]) urls.push(theme[k]!);
  }

  const map = await convertAll(urls);

  return sections.map((s) => {
    const theme = s.catalog.pdfTheme;
    return {
      ...s,
      catalog: {
        ...s.catalog,
        pdfTheme: theme
          ? {
              ...theme,
              ...Object.fromEntries(
                THEME_IMAGE_KEYS.map((k) => [k, theme[k] ? map.get(theme[k]!) ?? null : null])
              ),
            }
          : theme,
      },
      products: s.products.map((p) => ({
        ...p,
        images: p.images
          .map((img) => ({ ...img, url: map.get(img.url) ?? "" }))
          .filter((img) => img.url),
      })),
    };
  });
}
