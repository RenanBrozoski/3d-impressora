"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
