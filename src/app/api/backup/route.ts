import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/dal";

export async function GET() {
  await requireAdmin();

  const dbPath = path.join(process.cwd(), "dev.db");
  const buffer = await readFile(dbPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="backup-${timestamp}.db"`,
    },
  });
}
