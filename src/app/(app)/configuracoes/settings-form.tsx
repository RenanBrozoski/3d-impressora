"use client";

import { useActionState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Hint } from "@/components/ui/input";

type SettingsData = {
  nomeLoja: string;
  contatoTelefone: string | null;
  contatoEmail: string | null;
  enderecoOrcamento: string | null;
  valorPadraoKwh: number;
  potenciaPadraoW: number;
  valorHoraPadraoMaoDeObra: number;
  margemLucroPadraoPercent: number;
  taxaMinimaPedido: number;
  percentualDesperdicioPadrao: number;
};

export function SettingsForm({ settings }: { settings: SettingsData }) {
  const [state, formAction, pending] = useActionState(updateSettings, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-4">
        <h2 className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Dados do negócio</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nomeLoja">Nome da loja *</Label>
            <Input id="nomeLoja" name="nomeLoja" required defaultValue={settings.nomeLoja} />
          </div>
          <div>
            <Label htmlFor="contatoTelefone">Telefone de contato</Label>
            <Input id="contatoTelefone" name="contatoTelefone" defaultValue={settings.contatoTelefone ?? ""} />
          </div>
          <div>
            <Label htmlFor="contatoEmail">E-mail de contato</Label>
            <Input id="contatoEmail" name="contatoEmail" type="email" defaultValue={settings.contatoEmail ?? ""} />
          </div>
          <div>
            <Label htmlFor="enderecoOrcamento">Endereço (aparece em orçamentos/recibos)</Label>
            <Input id="enderecoOrcamento" name="enderecoOrcamento" defaultValue={settings.enderecoOrcamento ?? ""} />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Padrões da calculadora de custo/preço
        </h2>
        <p className="mb-4 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Só preenchem os campos de um item novo automaticamente — você ainda pode ajustar cada um na hora de montar o
          orçamento/pedido.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="valorPadraoKwh" className="flex items-center gap-1">
              Valor padrão do kWh
              <Hint text="Preço da energia elétrica na sua região, em R$ por kWh (confira na sua conta de luz)." />
            </Label>
            <Input id="valorPadraoKwh" name="valorPadraoKwh" type="number" step="0.01" defaultValue={settings.valorPadraoKwh} />
          </div>
          <div>
            <Label htmlFor="potenciaPadraoW">Potência padrão (W)</Label>
            <Input id="potenciaPadraoW" name="potenciaPadraoW" type="number" defaultValue={settings.potenciaPadraoW} />
          </div>
          <div>
            <Label htmlFor="valorHoraPadraoMaoDeObra">Valor/hora mão de obra padrão</Label>
            <Input
              id="valorHoraPadraoMaoDeObra"
              name="valorHoraPadraoMaoDeObra"
              type="number"
              step="0.01"
              defaultValue={settings.valorHoraPadraoMaoDeObra}
            />
          </div>
          <div>
            <Label htmlFor="margemLucroPadraoPercent" className="flex items-center gap-1">
              Margem de lucro padrão (%)
              <Hint text="Percentual de lucro desejado sobre o custo total da peça." />
            </Label>
            <Input
              id="margemLucroPadraoPercent"
              name="margemLucroPadraoPercent"
              type="number"
              step="0.1"
              defaultValue={settings.margemLucroPadraoPercent}
            />
          </div>
          <div>
            <Label htmlFor="taxaMinimaPedido" className="flex items-center gap-1">
              Taxa mínima por pedido
              <Hint text="Valor mínimo a cobrar por pedido, mesmo se a conta der um valor menor que isso." />
            </Label>
            <Input id="taxaMinimaPedido" name="taxaMinimaPedido" type="number" step="0.01" defaultValue={settings.taxaMinimaPedido} />
          </div>
          <div>
            <Label htmlFor="percentualDesperdicioPadrao" className="flex items-center gap-1">
              Desperdício padrão (%)
              <Hint text="Percentual de material perdido com purga/falhas de impressão, somado ao peso da peça." />
            </Label>
            <Input
              id="percentualDesperdicioPadrao"
              name="percentualDesperdicioPadrao"
              type="number"
              step="0.1"
              defaultValue={settings.percentualDesperdicioPadrao}
            />
          </div>
        </div>
      </div>

      <FieldError message={state?.erro} />
      {state?.ok && <p className="text-sm text-green-600 dark:text-green-400">Configurações salvas.</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
