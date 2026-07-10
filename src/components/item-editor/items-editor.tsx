"use client";

import { Plus } from "lucide-react";
import { calcular } from "@/lib/calculadora";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ItemCard } from "./item-card";
import { novoItemDraft, type ItemDraft, type ItemEditorRefs } from "./types";

export function ItemsEditor({
  items,
  onChange,
  refs,
}: {
  items: ItemDraft[];
  onChange: (items: ItemDraft[]) => void;
  refs: ItemEditorRefs;
}) {
  const totalGeral = items.reduce((sum, item) => sum + calcular({ ...item.calc, quantidade: item.quantidade }).valorTotal, 0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <ItemCard
          key={item.clientId}
          item={item}
          refs={refs}
          onChange={(updated) => {
            const next = [...items];
            next[index] = updated;
            onChange(next);
          }}
          onRemove={() => onChange(items.filter((_, i) => i !== index))}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...items, novoItemDraft(refs.settings)])}
      >
        <Plus size={16} />
        Adicionar item
      </Button>

      {items.length > 0 && (
        <div className="flex justify-end rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-right">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Valor total</p>
            <p className="text-xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(totalGeral)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
