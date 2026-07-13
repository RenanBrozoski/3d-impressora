import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  await verifySession();

  const { path: segments } = await params;
  const blobUrl = decodeURIComponent(segments.join("/"));

  let parsed: URL;
  try {
    parsed = new URL(blobUrl);
  } catch {
    return NextResponse.json({ erro: "Arquivo não encontrado." }, { status: 404 });
  }

  if (!parsed.hostname.endsWith(".private.blob.vercel-storage.com")) {
    return NextResponse.json({ erro: "Arquivo não encontrado." }, { status: 404 });
  }

  const upstream = await fetch(parsed, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!upstream.ok) {
    return NextResponse.json({ erro: "Arquivo não encontrado." }, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    },
  });
}
