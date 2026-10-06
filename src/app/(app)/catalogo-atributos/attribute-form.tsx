"use client";

import { useActionState, useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createAttribute, updateAttribute, type AttributeActionState } from "@/app/actions/catalog-attributes";
import { FieldError } from "@/components/ui/input";

type AttributeData = {
  id: number;
  nome: string;
  tipo: string;
  opcoes: string[] | null;
  unidade: string | null;
};

interface AttributeFormProps {
  attribute?: AttributeData;
  onSuccess?: () => void;
}

const TIPOS = [
  { value: "text", label: "Texto livre" },
  { value: "number", label: "Número" },
  { value: "select", label: "Seleção (opções fixas)" },
  { value: "boolean", label: "Sim / Não" },
];

export function AttributeForm({ attribute, onSuccess }: AttributeFormProps) {
  const isEditing = !!attribute;
  const action = isEditing
    ? updateAttribute.bind(null, attribute.id)
    : createAttribute;

  const [state, formAction, isPending] = useActionState<AttributeActionState, FormData>(
    action,
    undefined
  );

  const [tipo, setTipo] = useState(attribute?.tipo ?? "text");
  const [opcoes, setOpcoes] = useState<string[]>(attribute?.opcoes ?? []);
  const [opcaoInput, setOpcaoInput] = useState("");

  useEffect(() => {
    if (state?.sucesso) onSuccess?.();
  }, [state, onSuccess]);

  function addOpcao() {
    const v = opcaoInput.trim();
    if (v && !opcoes.includes(v)) setOpcoes((prev) => [...prev, v]);
    setOpcaoInput("");
  }

  function removeOpcao(o: string) {
    setOpcoes((prev) => prev.filter((x) => x !== o));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Nome */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Nome do atributo *
        </span>
        <input
          name="nome"
          required
          defaultValue={attribute?.nome ?? ""}
          placeholder="Ex: Tamanho, Material, Cor..."
          className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
        />
      </label>

      {/* Tipo */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tipo</span>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {/* Unidade (só para number) */}
      {tipo === "number" && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Unidade (opcional)
          </span>
          <input
            name="unidade"
            defaultValue={attribute?.unidade ?? ""}
            placeholder="Ex: cm, mm, g, kg..."
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
          />
        </label>
      )}

      {/* Opções (só para select) */}
      {tipo === "select" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Opções de seleção *
          </span>
          <div className="flex gap-2">
            <input
              value={opcaoInput}
              onChange={(e) => setOpcaoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOpcao();
                }
              }}
              placeholder="Digite uma opção e pressione Enter"
              className="flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
            />
            <button
              type="button"
              onClick={addOpcao}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--surface-border)] px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {opcoes.map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs text-neutral-700 dark:text-neutral-200"
              >
                {o}
                <button
                  type="button"
                  onClick={() => removeOpcao(o)}
                  className="ml-0.5 text-neutral-400 hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <input type="hidden" name="opcoes" value={JSON.stringify(opcoes)} />
        </div>
      )}

      <FieldError message={state?.erro} />

      {state?.sucesso && !isEditing && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          Atributo criado com sucesso!
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-[var(--surface-border)] pt-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_var(--ring)] disabled:opacity-70"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isEditing ? "Salvar alterações" : "Criar atributo"}
        </button>
      </div>
    </form>
  );
}
