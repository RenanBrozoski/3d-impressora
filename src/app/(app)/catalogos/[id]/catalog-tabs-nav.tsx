"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TABS = [
  { key: "produtos", label: "Produtos" },
  { key: "atributos", label: "Atributos" },
  { key: "tema-web", label: "Tema Web" },
  { key: "tema-pdf", label: "Tema PDF" },
] as const;

export function CatalogTabsNav({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function go(tab: string) {
    router.push(`${pathname}?tab=${tab}`);
  }

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--surface-border)] pb-px">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => go(tab.key)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
