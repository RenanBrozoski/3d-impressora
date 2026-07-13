import "server-only";
import { put } from "@vercel/blob";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".stl", ".obj", ".3mf", ".gcode", ".png", ".jpg", ".jpeg", ".webp", ".pdf"];

export class UploadError extends Error {}

function extname(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function saveUploadedFile(file: File) {
  const ext = extname(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new UploadError(`Tipo de arquivo não permitido: ${ext || "desconhecido"}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Arquivo maior que o limite de 50MB.");
  }

  const blob = await put(`uploads/${sanitizeFileName(file.name)}`, file, {
    access: "private",
    addRandomSuffix: true,
  });

  return {
    nomeArquivo: file.name,
    caminho: blob.url,
    tipo: file.type || ext.replace(".", ""),
    tamanhoBytes: file.size,
  };
}
