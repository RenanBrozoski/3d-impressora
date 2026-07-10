"use client";

import { useActionState, useEffect } from "react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

type ProductData = {
  id: number;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  pesoMedioG: number | null;
  tempoMedioH: number | null;
  materialRecomendado: string | null;
  custoMedio: number | null;
  precoSugerido: number | null;
  margemSugeridaPercent: number | null;
  observacoesImpressao: string | null;
  status: string;
};

export function ProductForm({ product, onSuccess }: { product?: ProductData; onSuccess: () => void }) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" required defaultValue={product?.nome} />
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" name="categoria" defaultValue={product?.categoria ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={2} defaultValue={product?.descricao ?? ""} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pesoMedioG">Peso médio (g)</Label>
          <Input id="pesoMedioG" name="pesoMedioG" type="number" step="0.1" defaultValue={product?.pesoMedioG ?? ""} />
        </div>
        <div>
          <Label htmlFor="tempoMedioH">Tempo médio (h)</Label>
          <Input id="tempoMedioH" name="tempoMedioH" type="number" step="0.1" defaultValue={product?.tempoMedioH ?? ""} />
        </div>
        <div>
          <Label htmlFor="materialRecomendado">Material recomendado</Label>
          <Input id="materialRecomendado" name="materialRecomendado" defaultValue={product?.materialRecomendado ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="custoMedio">Custo médio (R$)</Label>
          <Input id="custoMedio" name="custoMedio" type="number" step="0.01" defaultValue={product?.custoMedio ?? ""} />
        </div>
        <div>
          <Label htmlFor="precoSugerido">Preço sugerido (R$)</Label>
          <Input id="precoSugerido" name="precoSugerido" type="number" step="0.01" defaultValue={product?.precoSugerido ?? ""} />
        </div>
        <div>
          <Label htmlFor="margemSugeridaPercent">Margem sugerida (%)</Label>
          <Input
            id="margemSugeridaPercent"
            name="margemSugeridaPercent"
            type="number"
            step="0.1"
            defaultValue={product?.margemSugeridaPercent ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoesImpressao">Observações de impressão</Label>
        <Textarea
          id="observacoesImpressao"
          name="observacoesImpressao"
          rows={2}
          defaultValue={product?.observacoesImpressao ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={product?.status ?? "ATIVO"}>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </Select>
      </div>

      <FieldError message={state?.erro} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
