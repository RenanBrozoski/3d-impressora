import Link from "next/link";
import { db } from "@/lib/db";

export default async function CatalogoLayout({ children }: { children: React.ReactNode }) {
  const settings = await db.settings.findUnique({ where: { id: 1 } });
  const nomeLoja = settings?.nomeLoja ?? "Impressão 3D";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {settings?.logoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/api/logo" alt={nomeLoja} className="h-8 w-8 rounded-md object-contain" />
            )}
            <span className="font-semibold text-neutral-900 dark:text-white">{nomeLoja}</span>
          </div>
          <Link
            href="/catalogo"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            ← Catálogos
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--surface-border)] py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        {nomeLoja} · Todos os direitos reservados
      </footer>
    </div>
  );
}
