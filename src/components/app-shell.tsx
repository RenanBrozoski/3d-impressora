"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Box } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { AnimatedBackground } from "./animated-background";
import { logout } from "@/app/actions/auth";

type CurrentUser = {
  nome: string;
  papel: "ADMIN" | "OPERADOR";
};

function Logo({ nomeLoja, logoPath }: { nomeLoja: string; logoPath?: string | null }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      {logoPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/api/logo" alt={nomeLoja} className="h-8 w-8 shrink-0 rounded-lg object-contain" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_4px_14px_-4px_var(--ring)]">
          <Box size={16} className="text-white" strokeWidth={2.5} />
        </div>
      )}
      <span className="truncate font-semibold text-neutral-900 dark:text-white">{nomeLoja}</span>
    </div>
  );
}

export function AppShell({
  user,
  nomeLoja,
  logoPath,
  children,
}: {
  user: CurrentUser;
  nomeLoja: string;
  logoPath?: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen">
      <AnimatedBackground intensity="subtle" />

      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-[var(--surface-border)] bg-[var(--surface-solid)]/70 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center border-b border-[var(--surface-border)] px-4">
          <Logo nomeLoja={nomeLoja} logoPath={logoPath} />
        </div>
        <SidebarNav papel={user.papel} />
      </aside>

      {/* Sidebar mobile (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[var(--surface-solid)]"
            >
              <div className="flex h-16 items-center justify-between border-b border-[var(--surface-border)] px-4">
                <Logo nomeLoja={nomeLoja} logoPath={logoPath} />
                <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                  <X size={20} />
                </button>
              </div>
              <SidebarNav papel={user.papel} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--surface-border)] bg-[var(--background)]/70 px-4 backdrop-blur-xl">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/8 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.nome}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user.papel === "ADMIN" ? "Administrador" : "Operador"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-xs font-semibold text-white">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-white/8 dark:hover:text-red-400"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>

        <main className="relative flex-1 p-4 sm:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
