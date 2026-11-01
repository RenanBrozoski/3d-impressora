const PRIVATE_BLOB_HOST = ".private.blob.vercel-storage.com";

export function isPrivateBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(PRIVATE_BLOB_HOST);
  } catch {
    return false;
  }
}

// The Blob store is private, so browsers can't load blob URLs directly —
// catalog images go through /api/catalogo/imagem, which checks the DB whitelist.
export function catalogImageSrc<T extends string | null | undefined>(url: T): T {
  if (!url || !isPrivateBlobUrl(url)) return url;
  return `/api/catalogo/imagem?u=${encodeURIComponent(url)}` as T;
}

// Admin screens use the session-protected proxy, which also covers images
// uploaded but not saved yet (not in the catalog whitelist).
export function adminImageSrc<T extends string | null | undefined>(url: T): T {
  if (!url || !isPrivateBlobUrl(url)) return url;
  return `/api/uploads/${encodeURIComponent(url)}` as T;
}
