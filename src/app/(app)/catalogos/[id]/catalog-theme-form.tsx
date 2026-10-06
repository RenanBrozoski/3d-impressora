"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveCatalogTheme, uploadCatalogImage } from "@/app/actions/catalog";
import { ColorPicker } from "@/components/catalog/color-picker";
import { FieldError } from "@/components/ui/input";

type Theme = {
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  corFundo: string;
  imagemCapa?: string | null;
  imagemFundo?: string | null;
  logoUrl?: string | null;
  imagemDeco?: string | null;
  logoPosition: string;
  fundoOpacidade: number;
  cardStyle: string;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
} | null;

interface CatalogThemeFormProps {
  catalogId: number;
  theme: Theme;
}

function ImageField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCatalogImage(fd);
    if ("url" in result) setUrl(result.url);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... ou faça upload"
          className="flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
        />
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--surface-border)] px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-white/5">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : "Upload"}
          <input
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.svg"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </label>
      </div>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-1 h-16 w-auto rounded-lg border border-[var(--surface-border)] object-cover" />
      )}
    </div>
  );
}

export function CatalogThemeForm({ catalogId, theme }: CatalogThemeFormProps) {
  const action = saveCatalogTheme.bind(null, catalogId);
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Configurações visuais da página pública deste catálogo.
      </p>

      {/* Cores */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cores</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorPicker name="corPrimaria" label="Cor primária" defaultValue={theme?.corPrimaria ?? "#7c3aed"} />
          <ColorPicker name="corSecundaria" label="Cor secundária" defaultValue={theme?.corSecundaria ?? "#2563eb"} />
          <ColorPicker name="corTexto" label="Cor do texto" defaultValue={theme?.corTexto ?? "#ffffff"} />
          <ColorPicker name="corFundo" label="Cor de fundo" defaultValue={theme?.corFundo ?? "#f5f4fb"} />
        </div>
      </div>

      {/* Imagens */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Imagens</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageField name="imagemCapa" label="Imagem de capa" defaultValue={theme?.imagemCapa} />
          <ImageField name="imagemFundo" label="Imagem de fundo" defaultValue={theme?.imagemFundo} />
          <ImageField name="logoUrl" label="Logo" defaultValue={theme?.logoUrl} />
          <ImageField name="imagemDeco" label="Imagem decorativa" defaultValue={theme?.imagemDeco} />
        </div>
      </div>

      {/* Layout */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Layout</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Posição do logo</span>
            <select
              name="logoPosition"
              defaultValue={theme?.logoPosition ?? "left"}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Opacidade do fundo ({((theme?.fundoOpacidade ?? 0.15) * 100).toFixed(0)}%)
            </span>
            <input
              type="range"
              name="fundoOpacidade"
              min="0"
              max="1"
              step="0.05"
              defaultValue={theme?.fundoOpacidade ?? 0.15}
              className="mt-2 accent-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Estilo dos cards</span>
            <select
              name="cardStyle"
              defaultValue={theme?.cardStyle ?? "rounded"}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="rounded">Arredondado</option>
              <option value="flat">Plano</option>
              <option value="outlined">Contornado</option>
            </select>
          </label>
        </div>
      </div>

      {/* Cabeçalho/Rodapé */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cabeçalho e Rodapé</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Texto do cabeçalho</span>
            <input
              name="cabecalhoTexto"
              defaultValue={theme?.cabecalhoTexto ?? ""}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Texto opcional no topo da página..."
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Texto do rodapé</span>
            <input
              name="rodapeTexto"
              defaultValue={theme?.rodapeTexto ?? ""}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Texto opcional no rodapé..."
            />
          </label>
        </div>
      </div>

      <FieldError message={state?.erro} />
      {state?.sucesso && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          Tema salvo com sucesso!
        </p>
      )}

      <div className="border-t border-[var(--surface-border)] pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_var(--ring)] disabled:opacity-70"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          Salvar tema web
        </button>
      </div>
    </form>
  );
}
