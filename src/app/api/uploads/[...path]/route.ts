import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { verifySession } from "@/lib/dal";
import { resolveUploadPath } from "@/lib/upload";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  await verifySession();

  const { path: segments } = await params;
  const storedName = segments[segments.length - 1];
  const filePath = resolveUploadPath(storedName);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ erro: "Arquivo não encontrado." }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    }[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": contentType },
  });
}
