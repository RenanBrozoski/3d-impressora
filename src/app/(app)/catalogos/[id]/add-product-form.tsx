"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { addItemToCatalog } from "@/app/actions/catalog-items";

interface AddProductToCatalogFormProps {
  catalogId: number;
  items: { id: number; nome: string; sku: string | null }[];
}

export function AddProductToCatalogForm({ catalogId, items }: AddProductToCatalogFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState("");

  function handleAdd() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await addItemToCatalog(Number(selectedId), catalogId);
      if (result?.erro) alert(result.erro);
      else {
        setSelectedId("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1"
        disabled={pending}
      >
        <option value="">Selecionar produto...</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}{item.sku ? ` (${item.sku})` : ""}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        variant="secondary"
        onClick={handleAdd}
        disabled={!selectedId || pending}
      >
        <Plus size={15} />
        Adicionar
      </Button>
    </div>
  );
}
