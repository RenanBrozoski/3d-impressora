"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveCatalogPdfTheme, uploadCatalogImage } from "@/app/actions/catalog";
import { ColorPicker } from "@/components/catalog/color-picker";
import { FieldError } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type PdfThemeData = {
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  corFundo: string;
  imagemCapa?: string | null;
  imagemCapaSecao?: string | null;
  imagemFundo?: string | null;
  logoUrl?: string | null;
  imagemDeco?: string | null;
  produtosPorPagina: number;
  exibirNumeracao: boolean;
  exibirCabecalho: boolean;
  exibirRodape: boolean;
  cabecalhoTexto?: string | null;
  rodapeTexto?: string | null;
  fontePrimaria?: string | null;
  fonteSecundaria?: string | null;
} | null;

interface CatalogPdfThemeFormProps {
  catalogId: number;
  pdfTheme: PdfThemeData;
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

export function CatalogPdfThemeForm({ catalogId, pdfTheme }: CatalogPdfThemeFormProps) {
  const router = useRouter();
  const action = saveCatalogPdfTheme.bind(null, catalogId);
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [exibirNumeracao, setExibirNumeracao] = useState(pdfTheme?.exibirNumeracao ?? true);
  const [exibirCabecalho, setExibirCabecalho] = useState(pdfTheme?.exibirCabecalho ?? true);
  const [exibirRodape, setExibirRodape] = useState(pdfTheme?.exibirRodape ?? true);

  useEffect(() => {
    if (state?.sucesso) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Configurações visuais para exportação em PDF deste catálogo.
      </p>

      {/* Cores */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cores</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorPicker name="corPrimaria" label="Cor primária" defaultValue={pdfTheme?.corPrimaria ?? "#7c3aed"} />
          <ColorPicker name="corSecundaria" label="Cor secundária" defaultValue={pdfTheme?.corSecundaria ?? "#2563eb"} />
          <ColorPicker name="corTexto" label="Cor do texto" defaultValue={pdfTheme?.corTexto ?? "#14121f"} />
          <ColorPicker name="corFundo" label="Cor de fundo" defaultValue={pdfTheme?.corFundo ?? "#ffffff"} />
        </div>
      </div>

      {/* Imagens */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Imagens</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageField name="imagemCapa" label="Imagem de capa" defaultValue={pdfTheme?.imagemCapa} />
          <ImageField name="imagemCapaSecao" label="Imagem de capa de seção" defaultValue={pdfTheme?.imagemCapaSecao} />
          <ImageField name="imagemFundo" label="Imagem de fundo" defaultValue={pdfTheme?.imagemFundo} />
          <ImageField name="logoUrl" label="Logo" defaultValue={pdfTheme?.logoUrl} />
          <ImageField name="imagemDeco" label="Imagem decorativa" defaultValue={pdfTheme?.imagemDeco} />
        </div>
      </div>

      {/* Layout */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Configurações</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Produtos por página</span>
            <select
              name="produtosPorPagina"
              defaultValue={pdfTheme?.produtosPorPagina ?? 2}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Exibir</span>
            {/* Boolean fields as hidden + controlled state */}
            <input type="hidden" name="exibirNumeracao" value={exibirNumeracao ? "true" : "false"} />
            <input type="hidden" name="exibirCabecalho" value={exibirCabecalho ? "true" : "false"} />
            <input type="hidden" name="exibirRodape" value={exibirRodape ? "true" : "false"} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exibirNumeracao}
                onChange={(e) => setExibirNumeracao(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Numeração de páginas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exibirCabecalho}
                onChange={(e) => setExibirCabecalho(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Cabeçalho
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exibirRodape}
                onChange={(e) => setExibirRodape(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Rodapé
            </label>
          </div>
        </div>
      </div>

      {/* Cabeçalho/Rodapé */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Textos</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Texto do cabeçalho</span>
            <input
              name="cabecalhoTexto"
              defaultValue={pdfTheme?.cabecalhoTexto ?? ""}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Texto opcional no cabeçalho do PDF..."
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Texto do rodapé</span>
            <input
              name="rodapeTexto"
              defaultValue={pdfTheme?.rodapeTexto ?? ""}
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Texto opcional no rodapé do PDF..."
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Fonte primária</span>
            <input
              name="fontePrimaria"
              defaultValue={pdfTheme?.fontePrimaria ?? ""}
              placeholder="Ex: Inter"
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Fonte secundária</span>
            <input
              name="fonteSecundaria"
              defaultValue={pdfTheme?.fonteSecundaria ?? ""}
              placeholder="Ex: Playfair Display"
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>
      </div>

      <FieldError message={state?.erro} />

      {state?.sucesso && (
        <p className="text-sm text-green-600 dark:text-green-400">Tema PDF salvo com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_var(--ring)] disabled:opacity-50"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
        {isPending ? "Salvando..." : "Salvar tema PDF"}
      </button>
    </form>
  );
}
