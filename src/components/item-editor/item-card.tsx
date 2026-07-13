"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calcular } from "@/lib/calculadora";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, Hint } from "@/components/ui/input";
import type { ItemDraft, ItemEditorRefs, ItemMaterialExtraDraft } from "./types";

export function ItemCard({
  item,
  refs,
  onChange,
  onRemove,
}: {
  item: ItemDraft;
  refs: ItemEditorRefs;
  onChange: (item: ItemDraft) => void;
  onRemove: () => void;
}) {
  const resultado = calcular({
    ...item.calc,
    quantidade: item.quantidade,
    materiaisExtras: item.extras.map((e) => ({
      pesoG: e.pesoG,
      precoKg: refs.insumos.find((i) => i.id === e.inventoryItemId)?.precoPorUnidade ?? 0,
    })),
  });
  const filamentoSelecionado = refs.insumos.find((i) => i.id === item.inventoryItemId);

  function necessarioDe(insumo: (typeof refs.insumos)[number] | undefined, pesoUnidadeG: number) {
    if (!insumo) return 0;
    const pesoTotalG = pesoUnidadeG * item.quantidade;
    return insumo.unidade === "KG" ? pesoTotalG / 1000 : insumo.unidade === "G" ? pesoTotalG : item.quantidade;
  }

  const necessario = necessarioDe(filamentoSelecionado, item.calc.pesoUnidadeG);
  const estoqueInsuficiente = !!filamentoSelecionado && necessario > filamentoSelecionado.quantidadeAtual;

  function set(patch: Partial<ItemDraft>) {
    onChange({ ...item, ...patch });
  }

  function setCalc(patch: Partial<ItemDraft["calc"]>) {
    onChange({ ...item, calc: { ...item.calc, ...patch } });
  }

  function addExtra() {
    const novo: ItemMaterialExtraDraft = {
      clientId: `extra-${Math.random().toString(36).slice(2)}`,
      inventoryItemId: null,
      pesoG: 0,
    };
    set({ extras: [...item.extras, novo] });
  }

  function updateExtra(clientId: string, patch: Partial<ItemMaterialExtraDraft>) {
    set({ extras: item.extras.map((e) => (e.clientId === clientId ? { ...e, ...patch } : e)) });
  }

  function removeExtra(clientId: string) {
    set({ extras: item.extras.filter((e) => e.clientId !== clientId) });
  }

  function onProdutoChange(produtoId: string) {
    const produto = refs.produtos.find((p) => p.id === Number(produtoId));
    if (!produto) {
      set({ produtoId: null });
      return;
    }
    set({
      produtoId: produto.id,
      nomePeca: item.nomePeca || produto.nome,
      material: item.material || produto.materialRecomendado || "",
      calc: {
        ...item.calc,
        pesoUnidadeG: produto.pesoMedioG ?? item.calc.pesoUnidadeG,
        tempoImpressaoH: produto.tempoMedioH ?? item.calc.tempoImpressaoH,
      },
    });
  }

  function onInsumoChange(insumoId: string) {
    const insumo = refs.insumos.find((i) => i.id === Number(insumoId));
    if (!insumo) return;
    set({
      inventoryItemId: insumo.id,
      material: insumo.material ?? item.material,
      cor: insumo.cor ?? item.cor,
      calc: { ...item.calc, precoKgMaterial: insumo.precoPorUnidade },
    });
  }

  function onPrinterChange(printerId: string) {
    const printer = refs.printers.find((p) => p.id === Number(printerId));
    if (!printer) return;
    setCalc({ potenciaImpressoraW: printer.potenciaW, custoHoraMaquina: printer.custoEstimadoHora });
  }

  function onUserChange(userId: string) {
    const user = refs.users.find((u) => u.id === Number(userId));
    if (!user) return;
    setCalc({ valorHoraMaoObra: user.valorHora ?? item.calc.valorHoraMaoObra });
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>Produto do catálogo (opcional)</Label>
            <Select value={item.produtoId ?? ""} onChange={(e) => onProdutoChange(e.target.value)}>
              <option value="">Peça personalizada</option>
              {refs.produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Nome da peça *</Label>
            <Input value={item.nomePeca} onChange={(e) => set({ nomePeca: e.target.value })} required />
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input
              type="number"
              min={1}
              value={item.quantidade || ""}
              onChange={(e) => set({ quantidade: e.target.value === "" ? 0 : Number(e.target.value) })}
              onBlur={() => set({ quantidade: Math.max(1, item.quantidade || 1) })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover item"
          className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <SectionLabel>Material</SectionLabel>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <Label className="flex items-center gap-1.5">
            Insumo de estoque
            {filamentoSelecionado?.corHex && (
              <span
                className="inline-block h-3 w-3 rounded-full border border-[var(--surface-border)]"
                style={{ backgroundColor: filamentoSelecionado.corHex }}
                title={filamentoSelecionado.cor ?? ""}
              />
            )}
          </Label>
          <Select value={item.inventoryItemId ?? ""} onChange={(e) => onInsumoChange(e.target.value)}>
            <option value="">Selecionar para puxar preço...</option>
            {refs.insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </Select>
          {estoqueInsuficiente && filamentoSelecionado && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              Estoque insuficiente: disponível {formatNumber(filamentoSelecionado.quantidadeAtual)}{" "}
              {filamentoSelecionado.unidade.toLowerCase()}, precisa de {formatNumber(necessario)}{" "}
              {filamentoSelecionado.unidade.toLowerCase()}.
            </p>
          )}
        </div>
        <div>
          <Label>Material</Label>
          <Input value={item.material} onChange={(e) => set({ material: e.target.value })} placeholder="PLA, ABS, PETG..." />
        </div>
        <div>
          <Label>Cor</Label>
          <Input value={item.cor} onChange={(e) => set({ cor: e.target.value })} />
        </div>
        <NumField
          label="Peso (g)"
          value={item.calc.pesoUnidadeG}
          onChange={(v) => setCalc({ pesoUnidadeG: v })}
          hint="Peso de uma peça, em gramas — dá pra pesar na balança ou olhar a estimativa do seu slicer."
        />
      </div>

      {item.extras.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.extras.map((extra) => {
            const insumoExtra = refs.insumos.find((i) => i.id === extra.inventoryItemId);
            const necessarioExtra = necessarioDe(insumoExtra, extra.pesoG);
            const insuficienteExtra = !!insumoExtra && necessarioExtra > insumoExtra.quantidadeAtual;
            return (
              <div key={extra.clientId} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label className="flex items-center gap-1.5">
                    Insumo adicional
                    {insumoExtra?.corHex && (
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-[var(--surface-border)]"
                        style={{ backgroundColor: insumoExtra.corHex }}
                        title={insumoExtra.cor ?? ""}
                      />
                    )}
                  </Label>
                  <Select
                    value={extra.inventoryItemId ?? ""}
                    onChange={(e) => updateExtra(extra.clientId, { inventoryItemId: Number(e.target.value) || null })}
                  >
                    <option value="">Selecionar...</option>
                    {refs.insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                      </option>
                    ))}
                  </Select>
                  {insuficienteExtra && insumoExtra && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      Estoque insuficiente: disponível {formatNumber(insumoExtra.quantidadeAtual)}{" "}
                      {insumoExtra.unidade.toLowerCase()}, precisa de {formatNumber(necessarioExtra)}{" "}
                      {insumoExtra.unidade.toLowerCase()}.
                    </p>
                  )}
                </div>
                <NumField
                  label="Peso desse insumo (g)"
                  value={extra.pesoG}
                  onChange={(v) => updateExtra(extra.clientId, { pesoG: v })}
                />
                <button
                  type="button"
                  onClick={() => removeExtra(extra.clientId)}
                  aria-label="Remover insumo adicional"
                  className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={addExtra}
        className="mb-3 flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
      >
        <Plus size={14} />
        Adicionar insumo (impressão colorida/multimaterial)
      </button>

      <SectionLabel>Impressão</SectionLabel>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label>Impressora usada</Label>
          <Select defaultValue="" onChange={(e) => onPrinterChange(e.target.value)}>
            <option value="">Selecionar...</option>
            {refs.printers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </div>
        <NumField
          label="Tempo impressão (h)"
          value={item.calc.tempoImpressaoH}
          onChange={(v) => setCalc({ tempoImpressaoH: v })}
          step={0.1}
        />
        <NumField
          label="Preço/kg material"
          value={item.calc.precoKgMaterial}
          onChange={(v) => setCalc({ precoKgMaterial: v })}
          step={0.01}
          hint="Quanto custa 1kg desse material — preenchido automaticamente ao escolher o insumo de estoque."
        />
        <NumField
          label="Desperdício (%)"
          value={item.calc.percentualDesperdicio}
          onChange={(v) => setCalc({ percentualDesperdicio: v })}
          hint="Percentual de material perdido com purga/falhas de impressão, somado ao peso da peça."
        />
        <NumField
          label="Potência (W)"
          value={item.calc.potenciaImpressoraW}
          onChange={(v) => setCalc({ potenciaImpressoraW: v })}
          hint="Consumo de energia da impressora — preenchido automaticamente ao escolher a impressora."
        />
        <NumField
          label="Valor kWh"
          value={item.calc.valorKwh}
          onChange={(v) => setCalc({ valorKwh: v })}
          step={0.01}
          hint="Preço da energia elétrica na sua região, em R$ por kWh (confira na sua conta de luz)."
        />
        <NumField
          label="Custo hora máquina"
          value={item.calc.custoHoraMaquina}
          onChange={(v) => setCalc({ custoHoraMaquina: v })}
          step={0.01}
          hint="Quanto custa 1 hora de uso da impressora (depreciação/manutenção) — preenchido automaticamente ao escolher a impressora."
        />
      </div>

      <SectionLabel>Mão de obra</SectionLabel>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <Label>Operador</Label>
          <Select defaultValue="" onChange={(e) => onUserChange(e.target.value)}>
            <option value="">Selecionar...</option>
            {refs.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </Select>
        </div>
        <NumField
          label="Tempo mão de obra (h)"
          value={item.calc.tempoMaoObraH}
          onChange={(v) => setCalc({ tempoMaoObraH: v })}
          step={0.1}
          hint="Tempo de trabalho manual: preparar a impressão, pós-processar a peça, embalar etc."
        />
        <NumField
          label="Valor hora mão de obra"
          value={item.calc.valorHoraMaoObra}
          onChange={(v) => setCalc({ valorHoraMaoObra: v })}
          step={0.01}
          hint="Quanto vale 1 hora do seu trabalho — preenchido automaticamente ao escolher o operador."
        />
      </div>

      <SectionLabel>Custos extras e margem</SectionLabel>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-6">
        <NumField label="Acabamento (R$)" value={item.calc.custoAcabamento} onChange={(v) => setCalc({ custoAcabamento: v })} step={0.01} />
        <NumField label="Embalagem (R$)" value={item.calc.custoEmbalagem} onChange={(v) => setCalc({ custoEmbalagem: v })} step={0.01} />
        <NumField label="Outros custos" value={item.calc.outrosCustos} onChange={(v) => setCalc({ outrosCustos: v })} step={0.01} />
        <NumField
          label="Taxa mínima"
          value={item.calc.taxaMinima}
          onChange={(v) => setCalc({ taxaMinima: v })}
          step={0.01}
          hint="Valor mínimo a cobrar pelo pedido, mesmo se a conta der um valor menor que isso."
        />
        <NumField
          label="Margem (%)"
          value={item.calc.margemLucroPercent}
          onChange={(v) => setCalc({ margemLucroPercent: v })}
          hint="Percentual de lucro desejado sobre o custo total da peça."
        />
        <NumField label="Desconto (R$)" value={item.calc.desconto} onChange={(v) => setCalc({ desconto: v })} step={0.01} />
      </div>

      <div>
        <Label>Observações do item</Label>
        <Textarea rows={2} value={item.observacoes} onChange={(e) => set({ observacoes: e.target.value })} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-[var(--surface-border)] bg-gradient-to-br from-[var(--accent)]/8 to-[var(--accent-2)]/8 p-3 text-sm sm:grid-cols-5">
        <Result label="Custo unitário" value={resultado.custoTotalUnitario} />
        <Result label="Valor unitário" value={resultado.valorUnitario} highlight />
        <Result label="Valor total" value={resultado.valorTotal} highlight />
        <Result label="Lucro total" value={resultado.lucroTotal} />
        <Result label={`Margem real: ${resultado.margemRealPercent.toFixed(1)}%`} value={null} />
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1">
        {label}
        {hint && <Hint text={hint} />}
      </Label>
      <Input
        type="number"
        step={step}
        min={0}
        value={value || ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400 first:mt-0 dark:text-neutral-500">
      {children}
    </p>
  );
}

function Result({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      {value !== null && (
        <p className={`font-semibold ${highlight ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}
