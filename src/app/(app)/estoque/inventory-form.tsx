"use client";

import { useActionState, useEffect } from "react";
import { createInventoryItem, updateInventoryItem } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

type InventoryItemData = {
  id: number;
  nome: string;
  tipo: string;
  marca: string | null;
  material: string | null;
  cor: string | null;
  unidade: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCompra: number | null;
  precoPorUnidade: number;
  fornecedor: string | null;
  observacoes: string | null;
};

export function InventoryForm({ item, onSuccess }: { item?: InventoryItemData; onSuccess: () => void }) {
  const action = item ? updateInventoryItem : createInventoryItem;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" required defaultValue={item?.nome} />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select id="tipo" name="tipo" defaultValue={item?.tipo ?? "FILAMENTO"} required>
            <option value="FILAMENTO">Filamento</option>
            <option value="RESINA">Resina</option>
            <option value="EMBALAGEM">Embalagem</option>
            <option value="PECA">Peça</option>
            <option value="FERRAMENTA">Ferramenta</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" name="marca" defaultValue={item?.marca ?? ""} />
        </div>
        <div>
          <Label htmlFor="material">Material</Label>
          <Input id="material" name="material" placeholder="PLA, ABS, PETG..." defaultValue={item?.material ?? ""} />
        </div>
        <div>
          <Label htmlFor="cor">Cor</Label>
          <Input id="cor" name="cor" defaultValue={item?.cor ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="unidade">Unidade *</Label>
          <Select id="unidade" name="unidade" defaultValue={item?.unidade ?? "KG"} required>
            <option value="KG">kg</option>
            <option value="G">g</option>
            <option value="UNIDADE">unidade</option>
            <option value="LITRO">litro</option>
            <option value="ML">ml</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantidadeAtual">Qtd. atual</Label>
          <Input id="quantidadeAtual" name="quantidadeAtual" type="number" step="0.01" defaultValue={item?.quantidadeAtual ?? 0} />
        </div>
        <div>
          <Label htmlFor="quantidadeMinima">Qtd. mínima</Label>
          <Input id="quantidadeMinima" name="quantidadeMinima" type="number" step="0.01" defaultValue={item?.quantidadeMinima ?? 0} />
        </div>
        <div>
          <Label htmlFor="precoPorUnidade">Preço/unidade *</Label>
          <Input id="precoPorUnidade" name="precoPorUnidade" type="number" step="0.01" required defaultValue={item?.precoPorUnidade ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="precoCompra">Preço de compra (total)</Label>
          <Input id="precoCompra" name="precoCompra" type="number" step="0.01" defaultValue={item?.precoCompra ?? ""} />
        </div>
        <div>
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input id="fornecedor" name="fornecedor" defaultValue={item?.fornecedor ?? ""} />
        </div>
        <div>
          <Label htmlFor="dataCompra">Data da compra</Label>
          <Input id="dataCompra" name="dataCompra" type="date" />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={item?.observacoes ?? ""} />
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
