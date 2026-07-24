import "server-only";

// Busca o logo da loja (armazenado no Blob privado) e converte pra data URI,
// pro @react-pdf/renderer conseguir embutir a imagem sem precisar de rede
// no momento de gerar o PDF. Falha silenciosamente — o PDF sai sem logo.
export async function fetchLogoDataUri(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null;

  try {
    const resp = await fetch(logoPath, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!resp.ok) return null;

    const contentType = resp.headers.get("content-type") ?? "image/png";
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}
