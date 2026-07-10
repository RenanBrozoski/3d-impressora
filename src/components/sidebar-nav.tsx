"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_ITEMS } from "./nav-items";

export function SidebarNav({
  papel,
  onNavigate,
}: {
  papel: "ADMIN" | "OPERADOR";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.filter((item) => !item.adminOnly || papel === "ADMIN").map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className="relative">
            {isActive && (
              <motion.div
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] shadow-[0_4px_16px_-4px_var(--ring)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-neutral-600 hover:bg-neutral-900/5 dark:text-neutral-300 dark:hover:bg-white/8"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
