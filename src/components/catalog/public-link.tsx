"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

function useAbsoluteUrl(path: string) {
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  return `${origin}${path}`;
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copie o link:", text);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return { copied, copy };
}

export function PublicLinkBar({ path, label = "Link público" }: { path: string; label?: string }) {
  const url = useAbsoluteUrl(path);
  const { copied, copy } = useCopy();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2">
      <Link2 size={15} className="shrink-0 text-[var(--accent)]" />
      <span className="shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none dark:text-white"
      />
      <Button type="button" size="sm" onClick={() => copy(url)}>
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? "Copiado!" : "Copiar"}
      </Button>
      <a href={path} target="_blank" rel="noreferrer">
        <Button type="button" variant="outline" size="sm">
          <ExternalLink size={14} />
          Abrir
        </Button>
      </a>
    </div>
  );
}

export function CopyLinkIconButton({ path }: { path: string }) {
  const { copied, copy } = useCopy();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={copied ? "Link copiado" : "Copiar link público"}
      title={copied ? "Link copiado!" : "Copiar link público"}
      onClick={() => copy(`${window.location.origin}${path}`)}
    >
      {copied ? <Check size={15} className="text-emerald-500" /> : <Link2 size={15} />}
    </Button>
  );
}
