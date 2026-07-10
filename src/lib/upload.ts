import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
const MAX_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".stl", ".obj", ".3mf", ".gcode", ".png", ".jpg", ".jpeg", ".webp", ".pdf"];

export class UploadError extends Error {}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function saveUploadedFile(file: File) {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new UploadError(`Tipo de arquivo não permitido: ${ext || "desconhecido"}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Arquivo maior que o limite de 50MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const storedName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  return {
    nomeArquivo: file.name,
    caminho: storedName,
    tipo: file.type || ext.replace(".", ""),
    tamanhoBytes: file.size,
  };
}

export function resolveUploadPath(storedName: string) {
  const safeName = path.basename(storedName);
  return path.join(UPLOAD_DIR, safeName);
}
