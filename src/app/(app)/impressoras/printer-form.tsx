"use client";

import { useActionState, useEffect } from "react";
import { createPrinter, updatePrinter } from "@/app/actions/printers";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";

type PrinterData = {
  id: number;
  nome: string;
  modelo: string | null;
  tipo: string;
  potenciaW: number;
  areaImpressao: string | null;
  status: string;
  custoEstimadoHora: number;
  observacoes: string | null;
};

export function PrinterForm({ printer, onSuccess }: { printer?: PrinterData; onSuccess: () => void }) {
  const action = printer ? updatePrinter : createPrinter;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {printer && <input type="hidden" name="id" value={printer.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" required defaultValue={printer?.nome} />
        </div>
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" name="modelo" defaultValue={printer?.modelo ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select id="tipo" name="tipo" defaultValue={printer?.tipo ?? "FDM"} required>
            <option value="FDM">FDM</option>
            <option value="SLA">SLA</option>
            <option value="RESINA">Resina</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="potenciaW">Potência (W) *</Label>
          <Input id="potenciaW" name="potenciaW" type="number" required defaultValue={printer?.potenciaW ?? ""} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={printer?.status ?? "ATIVA"}>
            <option value="ATIVA">Ativa</option>
            <option value="MANUTENCAO">Em manutenção</option>
            <option value="PARADA">Parada</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="areaImpressao">Área de impressão</Label>
          <Input id="areaImpressao" name="areaImpressao" placeholder="220x220x250mm" defaultValue={printer?.areaImpressao ?? ""} />
        </div>
        <div>
          <Label htmlFor="custoEstimadoHora">Custo estimado/hora (R$)</Label>
          <Input
            id="custoEstimadoHora"
            name="custoEstimadoHora"
            type="number"
            step="0.01"
            defaultValue={printer?.custoEstimadoHora ?? 0}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={printer?.observacoes ?? ""} />
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
