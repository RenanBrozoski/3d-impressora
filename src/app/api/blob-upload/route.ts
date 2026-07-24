import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  ".stl",
  ".obj",
  ".3mf",
  ".gltf",
  ".glb",
  ".fbx",
  ".ply",
  ".dae",
  ".gcode",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".pdf",
];

function extname(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

// Emite o token de upload direto para o navegador enviar o arquivo ao Vercel
// Blob sem passar pelo corpo da nossa função serverless — evita o limite de
// ~4.5MB de payload que a Vercel impõe em Server Actions/API routes normais.
export async function POST(request: Request) {
  await verifySession();

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = extname(pathname);
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          throw new Error(`Tipo de arquivo não permitido: ${ext || "desconhecido"}`);
        }
        // Sem allowedContentTypes: já validamos pela extensão acima — muitos
        // formatos 3D (.stl, .3mf etc.) não têm um content-type consistente
        // entre navegadores, então filtrar por MIME aqui é frágil.
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_SIZE_BYTES,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro no upload." }, { status: 400 });
  }
}
