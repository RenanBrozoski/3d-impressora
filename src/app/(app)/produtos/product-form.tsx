"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { calcular, type CalculadoraInput } from "@/lib/calculadora";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError, Hint } from "@/components/ui/input";
import type { ItemEditorRefs } from "@/components/item-editor/types";
import { ModelViewer, isModelo3DVisualizavel } from "@/components/model-viewer";

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
  attachments: { id: number; nomeArquivo: string; caminho: string }[];
};

export function ProductForm({
  product,
  refs,
  onSuccess,
}: {
  product?: ProductData;
  refs: ItemEditorRefs;
  onSuccess: () => void;
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [materialRecomendado, setMaterialRecomendado] = useState(product?.materialRecomendado ?? "");
  const modeloExistente = product?.attachments.find((a) => isModelo3DVisualizavel(a.nomeArquivo));
  const [removerModelo, setRemoverModelo] = useState(false);
  const [mostrarViewer, setMostrarViewer] = useState(false);

  const [calc, setCalc] = useState<CalculadoraInput>({
    quantidade: 1,
    pesoUnidadeG: product?.pesoMedioG ?? 0,
    precoKgMaterial: 0,
    percentualDesperdicio: refs.settings.percentualDesperdicioPadrao,
    tempoImpressaoH: product?.tempoMedioH ?? 0,
    potenciaImpressoraW: refs.settings.potenciaPadraoW,
    valorKwh: refs.settings.valorPadraoKwh,
    custoHoraMaquina: 0,
    tempoMaoObraH: 0,
    valorHoraMaoObra: refs.settings.valorHoraPadraoMaoDeObra,
    custoAcabamento: 0,
    custoEmbalagem: 0,
    outrosCustos: 0,
    taxaMinima: refs.settings.taxaMinimaPedido,
    margemLucroPercent: product?.margemSugeridaPercent ?? refs.settings.margemLucroPadraoPercent,
    desconto: 0,
  });

  const resultado = calcular(calc);

  function setCalcField(patch: Partial<CalculadoraInput>) {
    setCalc((c) => ({ ...c, ...patch }));
  }

  function onInsumoChange(insumoId: string) {
    const insumo = refs.insumos.find((i) => i.id === Number(insumoId));
    if (!insumo) return;
    setCalcField({ precoKgMaterial: insumo.precoPorUnidade });
    if (!materialRecomendado && insumo.material) setMaterialRecomendado(insumo.material);
  }

  function onPrinterChange(printerId: string) {
    const printer = refs.printers.find((p) => p.id === Number(printerId));
    if (!printer) return;
    setCalcField({ potenciaImpressoraW: printer.potenciaW, custoHoraMaquina: printer.custoEstimadoHora });
  }

  function onUserChange(userId: string) {
    const user = refs.users.find((u) => u.id === Number(userId));
    if (!user) return;
    setCalcField({ valorHoraMaoObra: user.valorHora ?? calc.valorHoraMaoObra });
  }

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="custoMedio" value={resultado.custoTotalUnitario} />
      <input type="hidden" name="precoSugerido" value={resultado.valorUnitario} />
      <input type="hidden" name="pesoMedioG" value={calc.pesoUnidadeG} />
      <input type="hidden" name="tempoMedioH" value={calc.tempoImpressaoH} />

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

      <SectionLabel>Modelo 3D</SectionLabel>
      {modeloExistente && !removerModelo ? (
        <div className="mb-3 card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm text-neutral-700 dark:text-neutral-300">{modeloExistente.nomeArquivo}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setMostrarViewer((v) => !v)}>
                {mostrarViewer ? "Ocultar" : "Visualizar"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRemoverModelo(true)}>
                Remover
              </Button>
            </div>
          </div>
          {mostrarViewer && (
            <ModelViewer
              url={`/api/uploads/${encodeURIComponent(modeloExistente.caminho)}`}
              nomeArquivo={modeloExistente.nomeArquivo}
              height={260}
              className="mt-3"
            />
          )}
        </div>
      ) : (
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          {removerModelo ? "O modelo será removido ao salvar." : "Nenhum modelo 3D anexado ainda."}
        </p>
      )}
      <input type="hidden" name="removerModelo3d" value={removerModelo ? "1" : ""} />
      <div className="mb-4">
        <Label htmlFor="modelo3d">{modeloExistente ? "Substituir modelo 3D" : "Anexar modelo 3D"}</Label>
        <Input id="modelo3d" name="modelo3d" type="file" accept=".stl,.obj,.3mf,.gltf,.glb,.fbx,.ply,.dae" />
      </div>

      <SectionLabel>Calculadora de custo e preço sugerido</SectionLabel>
      <p className="mb-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Preencha os campos abaixo e o sistema calcula sozinho o custo e o preço sugerido dessa peça — considerando
        filamento, energia, depreciação da impressora e mão de obra.
      </p>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumField
          label="Peso médio (g)"
          value={calc.pesoUnidadeG}
          onChange={(v) => setCalcField({ pesoUnidadeG: v })}
        />
        <NumField
          label="Tempo médio (h)"
          value={calc.tempoImpressaoH}
          onChange={(v) => setCalcField({ tempoImpressaoH: v })}
          step={0.1}
        />
        <div>
          <Label htmlFor="materialRecomendado">Material recomendado</Label>
          <Input
            id="materialRecomendado"
            name="materialRecomendado"
            value={materialRecomendado}
            onChange={(e) => setMaterialRecomendado(e.target.value)}
          />
        </div>
        <div>
          <Label>Insumo de estoque</Label>
          <Select defaultValue="" onChange={(e) => onInsumoChange(e.target.value)}>
            <option value="">Selecionar para puxar preço...</option>
            {refs.insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </Select>
        </div>
      </div>

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
          label="Preço/kg material"
          value={calc.precoKgMaterial}
          onChange={(v) => setCalcField({ precoKgMaterial: v })}
          step={0.01}
          hint="Quanto custa 1kg desse material — preenchido automaticamente ao escolher o insumo de estoque."
        />
        <NumField
          label="Desperdício (%)"
          value={calc.percentualDesperdicio}
          onChange={(v) => setCalcField({ percentualDesperdicio: v })}
          hint="Percentual de material perdido com purga/falhas de impressão, somado ao peso da peça."
        />
        <NumField
          label="Valor kWh"
          value={calc.valorKwh}
          onChange={(v) => setCalcField({ valorKwh: v })}
          step={0.01}
          hint="Preço da energia elétrica na sua região, em R$ por kWh."
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          value={calc.tempoMaoObraH}
          onChange={(v) => setCalcField({ tempoMaoObraH: v })}
          step={0.1}
          hint="Tempo de trabalho manual: preparar a impressão, pós-processar a peça, embalar etc."
        />
        <NumField
          label="Acabamento (R$)"
          value={calc.custoAcabamento}
          onChange={(v) => setCalcField({ custoAcabamento: v })}
          step={0.01}
        />
        <NumField
          label="Embalagem (R$)"
          value={calc.custoEmbalagem}
          onChange={(v) => setCalcField({ custoEmbalagem: v })}
          step={0.01}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumField
          label="Taxa mínima"
          value={calc.taxaMinima}
          onChange={(v) => setCalcField({ taxaMinima: v })}
          step={0.01}
          hint="Valor mínimo a cobrar por essa peça, mesmo se a conta der um valor menor que isso."
        />
        <NumField
          label="Margem sugerida (%)"
          name="margemSugeridaPercent"
          value={calc.margemLucroPercent}
          onChange={(v) => setCalcField({ margemLucroPercent: v })}
          hint="Percentual de lucro desejado sobre o custo total da peça."
        />
        <Result label="Custo médio" value={resultado.custoTotalUnitario} />
        <Result label="Preço sugerido" value={resultado.valorUnitario} highlight />
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

function NumField({
  label,
  value,
  onChange,
  step = 1,
  hint,
  name,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  hint?: string;
  name?: string;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1">
        {label}
        {hint && <Hint text={hint} />}
      </Label>
      <Input
        type="number"
        name={name}
        step={step}
        min={0}
        value={value || ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

function Result({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--surface-border)] bg-gradient-to-br from-[var(--accent)]/8 to-[var(--accent-2)]/8 px-3 py-2">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`font-semibold ${highlight ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400 first:mt-0 dark:text-neutral-500">
      {children}
    </p>
  );
}
