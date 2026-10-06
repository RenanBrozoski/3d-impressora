"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createCatalog } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

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

export function CatalogCreateForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createCatalog, undefined);
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [ativo, setAtivo] = useState(true);

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
            Usado na URL pública do catálogo.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={3} placeholder="Descrição opcional..." />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="icone">Ícone (emoji)</Label>
          <Input
            id="icone"
            name="icone"
            placeholder="🛍️"
            maxLength={10}
            className="text-2xl"
          />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select id="tipo" name="tipo" defaultValue="catalogo">
            <option value="catalogo">Catálogo</option>
            <option value="colecao">Coleção</option>
          </Select>
        </div>
      </div>

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
          {ativo ? "Ativo" : "Inativo"}
        </span>
      </div>

      <FieldError message={state?.erro} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar catálogo"}
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
