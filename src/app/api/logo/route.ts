import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Serve a logo da loja sem exigir sessão — ao contrário de /api/uploads,
// usado pelos anexos internos, a logo precisa aparecer em páginas públicas
// como /solicitar e /login. Não recebe path do cliente, só serve o que está
// salvo em Settings.logoPath, então não há risco de acessar outros arquivos.
export async function GET() {
  const settings = await db.settings.findUnique({ where: { id: 1 }, select: { logoPath: true } });
  if (!settings?.logoPath) {
    return NextResponse.json({ erro: "Nenhuma logo cadastrada." }, { status: 404 });
  }

  const upstream = await fetch(settings.logoPath, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!upstream.ok) {
    return NextResponse.json({ erro: "Logo não encontrada." }, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=300",
    },
  });
}
