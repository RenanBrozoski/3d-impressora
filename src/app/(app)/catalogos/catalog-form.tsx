"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createCatalog, updateCatalog } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

const EMOJI_GROUPS = [
  { label: "Impressão 3D", emojis: ["🖨️","🔧","⚙️","🔩","🛠️","🏗️","🏭","🔬","🔭","💡","🧲","🔌","💻","🖥️","📐","📏","✏️","🖊️","📦","📫"] },
  { label: "Produtos", emojis: ["🛍️","🧸","🎮","🚗","✈️","🚀","🤖","👑","💎","🏆","🎁","🎨","🖼️","🧩","🪆","🪅","🎯","🎪","🎭","🎠"] },
  { label: "Natureza", emojis: ["🌿","🌱","🌳","🍃","🌸","🌺","🌻","🦋","🐝","🌊","🏔️","🌋","🌍","☀️","🌙","⭐","❄️","🔥","💧","🌈"] },
  { label: "Negócios", emojis: ["💼","📊","📈","📉","💰","🏦","🤝","📋","📌","📎","🗂️","📁","📂","🗄️","🏢","🏬","🛒","🏪","🏷️","💳"] },
  { label: "Formas", emojis: ["⬛","🟥","🟧","🟨","🟩","🟦","🟪","⬜","🔴","🟠","🟡","🟢","🔵","🟣","⚫","🔶","🔷","🔸","🔹","💠"] },
];

function buildSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CatalogData = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  icone: string | null;
  ativo: boolean;
  tipo: string;
  ordem: number;
};

interface CatalogFormProps {
  catalog?: CatalogData;
}

export function CatalogForm({ catalog }: CatalogFormProps) {
  const router = useRouter();
  const isEditing = !!catalog;

  const action = isEditing
    ? updateCatalog.bind(null, catalog.id)
    : createCatalog;

  const [state, formAction, pending] = useActionState(action, undefined);
  const [slug, setSlug] = useState(catalog?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEditing);
  const [ativo, setAtivo] = useState(catalog?.ativo ?? true);
  const [icone, setIcone] = useState(catalog?.icone ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerGroup, setPickerGroup] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [pickerOpen]);

  useEffect(() => {
    if (state?.sucesso) {
      router.push("/catalogos");
    }
  }, [state, router]);

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugManual) {
      setSlug(buildSlug(e.target.value));
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            required
            placeholder="Ex: Catálogo 2025"
            defaultValue={catalog?.nome}
            onChange={handleNomeChange}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            required
            placeholder="ex: catalogo-2025"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Usado na URL pública: /catalogo/<strong>{slug || "…"}</strong>
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={3}
          placeholder="Descrição opcional..."
          defaultValue={catalog?.descricao ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative" ref={pickerRef}>
          <Label htmlFor="icone">Ícone (emoji)</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="flex h-10 w-14 items-center justify-center rounded-lg border border-neutral-300 bg-white/80 text-2xl transition-colors hover:border-[var(--accent)] dark:border-white/10 dark:bg-white/5"
            >
              {icone || "➕"}
            </button>
            <Input
              id="icone"
              name="icone"
              placeholder="ou cole aqui"
              maxLength={10}
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              className="text-xl"
            />
            {icone && (
              <button
                type="button"
                onClick={() => setIcone("")}
                className="px-2 text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {pickerOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-[var(--surface-border)] bg-white shadow-xl dark:bg-neutral-900">
              <div className="flex gap-1 overflow-x-auto border-b border-[var(--surface-border)] p-2">
                {EMOJI_GROUPS.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickerGroup(i)}
                    className={`shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      pickerGroup === i
                        ? "bg-[var(--accent)] text-white"
                        : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 p-2">
                {EMOJI_GROUPS[pickerGroup].emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setIcone(emoji); setPickerOpen(false); }}
                    className="flex h-8 w-8 items-center justify-center rounded text-xl hover:bg-neutral-100 dark:hover:bg-white/10"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select id="tipo" name="tipo" defaultValue={catalog?.tipo ?? "catalogo"}>
            <option value="catalogo">Catálogo</option>
            <option value="colecao">Coleção</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="ordem">Ordem</Label>
          <Input
            id="ordem"
            name="ordem"
            type="number"
            min={0}
            defaultValue={catalog?.ordem ?? 0}
          />
        </div>
      </div>

      {/* Switch ativo/inativo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          onClick={() => setAtivo((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            ativo ? "bg-[var(--accent)]" : "bg-neutral-300 dark:bg-neutral-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
              ativo ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <input type="hidden" name="ativo" value={ativo ? "true" : "false"} />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {ativo ? "Ativo (visível publicamente)" : "Inativo (oculto)"}
        </span>
      </div>

      <FieldError message={state?.erro} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar catálogo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/catalogos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
