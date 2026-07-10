"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { logout } from "@/app/actions/auth";

type CurrentUser = {
  nome: string;
  papel: "ADMIN" | "OPERADOR";
};

export function AppShell({
  user,
  nomeLoja,
  children,
}: {
  user: CurrentUser;
  nomeLoja: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex">
        <div className="flex h-16 items-center border-b border-neutral-200 px-4 dark:border-neutral-800">
          <span className="truncate font-semibold text-neutral-900 dark:text-white">{nomeLoja}</span>
        </div>
        <SidebarNav papel={user.papel} />
      </aside>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-neutral-900">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
              <span className="truncate font-semibold text-neutral-900 dark:text-white">{nomeLoja}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>
            <SidebarNav papel={user.papel} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
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
            <form action={logout}>
              <button
                type="submit"
                aria-label="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-red-400"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 bg-neutral-50 p-4 dark:bg-neutral-950 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
