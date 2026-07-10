"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuote, updateQuote } from "@/app/actions/quotes";
import { calcular } from "@/lib/calculadora";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { ItemsEditor } from "@/components/item-editor/items-editor";
import { novoItemDraft, type ItemDraft, type ItemEditorRefs } from "@/components/item-editor/types";

type CustomerOption = { id: number; nome: string };

export function QuoteForm({
  refs,
  customers,
  quote,
}: {
  refs: ItemEditorRefs;
  customers: CustomerOption[];
  quote?: {
    id: number;
    customerId: number;
    validade: string | null;
    observacoes: string | null;
    items: ItemDraft[];
  };
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number | "">(quote?.customerId ?? "");
  const [validade, setValidade] = useState(quote?.validade ?? "");
  const [observacoes, setObservacoes] = useState(quote?.observacoes ?? "");
  const [items, setItems] = useState<ItemDraft[]>(quote?.items ?? [novoItemDraft(refs.settings)]);
  const [erro, setErro] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(undefined);

    if (!customerId) {
      setErro("Selecione um cliente.");
      return;
    }

    const payloadItems = items.map((item) => {
      const resultado = calcular({ ...item.calc, quantidade: item.quantidade });
      return {
        produtoId: item.produtoId,
        inventoryItemId: item.inventoryItemId,
        nomePeca: item.nomePeca,
        quantidade: item.quantidade,
        material: item.material,
        cor: item.cor,
        pesoUnidadeG: item.calc.pesoUnidadeG,
        tempoImpressaoH: item.calc.tempoImpressaoH,
        precoKgMaterial: item.calc.precoKgMaterial,
        percentualDesperdicio: item.calc.percentualDesperdicio,
        potenciaImpressoraW: item.calc.potenciaImpressoraW,
        valorKwh: item.calc.valorKwh,
        custoHoraMaquina: item.calc.custoHoraMaquina,
        tempoMaoObraH: item.calc.tempoMaoObraH,
        valorHoraMaoObra: item.calc.valorHoraMaoObra,
        taxaMinima: item.calc.taxaMinima,
        margemLucroPercent: item.calc.margemLucroPercent,
        desconto: item.calc.desconto,
        custoMaterial: resultado.custoMaterial,
        custoEnergia: resultado.custoEnergia,
        custoMaquina: resultado.custoMaquina,
        custoMaoObra: resultado.custoMaoObra,
        custoAcabamento: resultado.custoAcabamento,
        custoEmbalagem: resultado.custoEmbalagem,
        outrosCustos: resultado.outrosCustos,
        valorUnitario: resultado.valorUnitario,
        valorTotal: resultado.valorTotal,
        lucroEstimado: resultado.lucroTotal,
        observacoes: item.observacoes,
      };
    });

    setPending(true);
    try {
      if (quote) {
        await updateQuote(quote.id, { customerId: Number(customerId), validade: validade || null, observacoes, items: payloadItems });
      } else {
        await createQuote({ customerId: Number(customerId), validade: validade || null, observacoes, items: payloadItems });
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
        setErro(err.message);
        setPending(false);
      }
      // NEXT_REDIRECT é esperado: o redirect() da action já navegou.
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <Label>Cliente *</Label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")} required>
            <option value="">Selecione...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Validade</Label>
          <Input type="date" value={validade ?? ""} onChange={(e) => setValidade(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <Label>Observações</Label>
          <Textarea rows={1} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>
      </div>

      <ItemsEditor items={items} onChange={setItems} refs={refs} />

      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar orçamento"}
        </Button>
      </div>
    </form>
  );
}
