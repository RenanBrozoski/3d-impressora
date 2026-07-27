import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".stl", ".obj", ".3mf", ".gltf", ".glb", ".fbx", ".ply", ".dae", ".gcode", ".png", ".jpg", ".jpeg", ".webp", ".pdf"];

function extname(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

// Igual a /api/blob-upload, mas sem exigir sessão — usado pelo formulário
// público /solicitar, onde o visitante nunca está logado. A validação de
// extensão/tamanho abaixo é a única proteção aqui (não tem autenticação).
export async function POST(request: Request) {
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
