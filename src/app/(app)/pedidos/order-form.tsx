"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/orders";
import { calcular } from "@/lib/calculadora";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { ItemsEditor } from "@/components/item-editor/items-editor";
import { novoItemDraft, type ItemDraft, type ItemEditorRefs } from "@/components/item-editor/types";

type CustomerOption = { id: number; nome: string };

export function OrderForm({ refs, customers }: { refs: ItemEditorRefs; customers: CustomerOption[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number | "">("");
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([novoItemDraft(refs.settings)]);
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
      const extras = item.extras.filter((e) => e.inventoryItemId != null);
      const materiaisExtras = extras.map((e) => ({
        pesoG: e.pesoG,
        precoKg: refs.insumos.find((i) => i.id === e.inventoryItemId)?.precoPorUnidade ?? 0,
      }));
      const resultado = calcular({ ...item.calc, quantidade: item.quantidade, materiaisExtras });
      return {
        produtoId: item.produtoId,
        inventoryItemId: item.inventoryItemId,
        extras: extras.map((e) => ({ inventoryItemId: e.inventoryItemId as number, pesoG: e.pesoG })),
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
      await createOrder({
        customerId: Number(customerId),
        prazoEntrega: prazoEntrega || null,
        formaPagamento,
        observacoes,
        items: payloadItems,
      });
    } catch (err) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
        setErro(err.message);
        setPending(false);
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 card p-4 sm:grid-cols-4">
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
          <Label>Prazo de entrega</Label>
          <Input type="date" value={prazoEntrega} onChange={(e) => setPrazoEntrega(e.target.value)} />
        </div>
        <div>
          <Label>Forma de pagamento</Label>
          <Input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} placeholder="Pix, cartão..." />
        </div>
        <div>
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
          {pending ? "Salvando..." : "Salvar pedido"}
        </Button>
      </div>
    </form>
  );
}
