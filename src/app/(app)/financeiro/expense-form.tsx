"use client";

import { useActionState, useEffect } from "react";
import { createExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

export function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(createExpense, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select id="categoria" name="categoria" defaultValue="OUTRO" required>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="MATERIAL">Material</option>
            <option value="EMBALAGEM">Embalagem</option>
            <option value="ENERGIA">Energia</option>
            <option value="MARKETING">Marketing</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input id="valor" name="valor" type="number" step="0.01" required />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Input id="descricao" name="descricao" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data">Data</Label>
          <Input id="data" name="data" type="date" />
        </div>
        <div>
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input id="fornecedor" name="fornecedor" />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} />
      </div>

      <FieldError message={state?.erro} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar despesa"}
        </Button>
      </div>
    </form>
  );
}
