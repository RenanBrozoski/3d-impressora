"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { createProduct, updateProduct } from "@/app/actions/products";
import { calcular, type CalculadoraInput } from "@/lib/calculadora";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError, Hint, NumberInput } from "@/components/ui/input";
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
  fotoPath: string | null;
  precoKgMaterial: number | null;
  percentualDesperdicio: number | null;
  potenciaImpressoraW: number | null;
  valorKwh: number | null;
  custoHoraMaquina: number | null;
  tempoMaoObraH: number | null;
  valorHoraMaoObra: number | null;
  custoAcabamento: number | null;
  custoEmbalagem: number | null;
  outrosCustos: number | null;
  taxaMinima: number | null;
  desconto: number | null;
  attachments: { id: number; nomeArquivo: string; caminho: string }[];
  materiaisExtras: { id: number; inventoryItemId: number; pesoG: number }[];
};

type ExtraDraft = { clientId: string; inventoryItemId: number | null; pesoG: number };

export function ProductForm({
  product,
  refs,
  onSuccess,
  onCancel,
  readOnly = false,
}: {
  product?: ProductData;
  refs: ItemEditorRefs;
  onSuccess: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [materialRecomendado, setMaterialRecomendado] = useState(product?.materialRecomendado ?? "");
  const modeloExistente = product?.attachments.find((a) => isModelo3DVisualizavel(a.nomeArquivo));
  const [removerModelo, setRemoverModelo] = useState(false);
  const [mostrarViewer, setMostrarViewer] = useState(false);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [novaFotoPreview, setNovaFotoPreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [modeloNovo, setModeloNovo] = useState<{ url: string; nome: string; tamanho: number } | null>(null);
  const [enviandoModelo, setEnviandoModelo] = useState(false);
  const [erroModelo, setErroModelo] = useState<string | null>(null);

  async function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroFoto(null);
    setRemoverFoto(false);
    setNovaFotoPreview(URL.createObjectURL(file));
    setEnviandoFoto(true);
    try {
      const blob = await upload(file.name, file, { access: "private", handleUploadUrl: "/api/blob-upload" });
      setFotoUrl(blob.url);
    } catch (err) {
      setErroFoto(err instanceof Error ? err.message : "Falha ao enviar a foto.");
      setNovaFotoPreview(null);
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function onModeloChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroModelo(null);
    setEnviandoModelo(true);
    try {
      const blob = await upload(file.name, file, { access: "private", handleUploadUrl: "/api/blob-upload" });
      setModeloNovo({ url: blob.url, nome: file.name, tamanho: file.size });
      setRemoverModelo(false);
    } catch (err) {
      setErroModelo(err instanceof Error ? err.message : "Falha ao enviar o modelo 3D.");
    } finally {
      setEnviandoModelo(false);
    }
  }

  const [calc, setCalc] = useState<CalculadoraInput>({
    quantidade: 1,
    pesoUnidadeG: product?.pesoMedioG ?? 0,
    precoKgMaterial: product?.precoKgMaterial ?? 0,
    percentualDesperdicio: product?.percentualDesperdicio ?? refs.settings.percentualDesperdicioPadrao,
    tempoImpressaoH: product?.tempoMedioH ?? 0,
    potenciaImpressoraW: product?.potenciaImpressoraW ?? refs.settings.potenciaPadraoW,
    valorKwh: product?.valorKwh ?? refs.settings.valorPadraoKwh,
    custoHoraMaquina: product?.custoHoraMaquina ?? 0,
    tempoMaoObraH: product?.tempoMaoObraH ?? 0,
    valorHoraMaoObra: product?.valorHoraMaoObra ?? refs.settings.valorHoraPadraoMaoDeObra,
    custoAcabamento: product?.custoAcabamento ?? 0,
    custoEmbalagem: product?.custoEmbalagem ?? 0,
    outrosCustos: product?.outrosCustos ?? 0,
    taxaMinima: product?.taxaMinima ?? refs.settings.taxaMinimaPedido,
    margemLucroPercent: product?.margemSugeridaPercent ?? refs.settings.margemLucroPadraoPercent,
    desconto: product?.desconto ?? 0,
  });
  const [extras, setExtras] = useState<ExtraDraft[]>(
    product?.materiaisExtras.map((m) => ({ clientId: `extra-${m.id}`, inventoryItemId: m.inventoryItemId, pesoG: m.pesoG })) ?? [],
  );

  const resultado = calcular({
    ...calc,
    materiaisExtras: extras
      .filter((e) => e.inventoryItemId != null)
      .map((e) => ({
        pesoG: e.pesoG,
        precoKg: refs.insumos.find((i) => i.id === e.inventoryItemId)?.precoPorUnidade ?? 0,
      })),
  });

  function setCalcField(patch: Partial<CalculadoraInput>) {
    setCalc((c) => ({ ...c, ...patch }));
  }

  function addExtra() {
    setExtras((atual) => [...atual, { clientId: `extra-${Math.random().toString(36).slice(2)}`, inventoryItemId: null, pesoG: 0 }]);
  }

  function updateExtra(clientId: string, patch: Partial<ExtraDraft>) {
    setExtras((atual) => atual.map((e) => (e.clientId === clientId ? { ...e, ...patch } : e)));
  }

  function removeExtra(clientId: string) {
    setExtras((atual) => atual.filter((e) => e.clientId !== clientId));
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
      <input type="hidden" name="precoKgMaterial" value={calc.precoKgMaterial} />
      <input type="hidden" name="percentualDesperdicio" value={calc.percentualDesperdicio} />
      <input type="hidden" name="potenciaImpressoraW" value={calc.potenciaImpressoraW} />
      <input type="hidden" name="valorKwh" value={calc.valorKwh} />
      <input type="hidden" name="custoHoraMaquina" value={calc.custoHoraMaquina} />
      <input type="hidden" name="tempoMaoObraH" value={calc.tempoMaoObraH} />
      <input type="hidden" name="valorHoraMaoObra" value={calc.valorHoraMaoObra} />
      <input type="hidden" name="custoAcabamento" value={calc.custoAcabamento} />
      <input type="hidden" name="custoEmbalagem" value={calc.custoEmbalagem} />
      <input type="hidden" name="outrosCustos" value={calc.outrosCustos} />
      <input type="hidden" name="taxaMinima" value={calc.taxaMinima} />
      <input type="hidden" name="desconto" value={calc.desconto} />
      <input
        type="hidden"
        name="extrasJson"
        value={JSON.stringify(extras.filter((e) => e.inventoryItemId != null))}
      />

      <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
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

      <SectionLabel>Foto do produto</SectionLabel>
      <div className="mb-4 flex items-start gap-3">
        {novaFotoPreview || (product?.fotoPath && !removerFoto) ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={novaFotoPreview ?? `/api/uploads/${encodeURIComponent(product!.fotoPath!)}`}
              alt="Foto do produto"
              className="h-20 w-20 rounded-lg border border-[var(--surface-border)] object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRemoverFoto(true);
                setNovaFotoPreview(null);
              }}
            >
              Remover
            </Button>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {removerFoto ? "A foto será removida ao salvar." : "Nenhuma foto anexada ainda."}
          </p>
        )}
      </div>
      <input type="hidden" name="removerFoto" value={removerFoto ? "1" : ""} />
      {fotoUrl && <input type="hidden" name="fotoUrl" value={fotoUrl} />}
      <div className="mb-4">
        <Label htmlFor="foto">{product?.fotoPath ? "Substituir foto" : "Anexar foto"}</Label>
        <Input
          id="foto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={enviandoFoto}
          onChange={onFotoChange}
        />
        {enviandoFoto && <UploadingBadge texto="Enviando foto..." />}
        <FieldError message={erroFoto ?? undefined} />
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
              <a
                href={`/api/uploads/${encodeURIComponent(modeloExistente.caminho)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded-md px-3 text-sm text-neutral-600 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] dark:text-neutral-300"
              >
                Baixar
              </a>
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
      {modeloNovo && (
        <>
          <input type="hidden" name="modelo3dUrl" value={modeloNovo.url} />
          <input type="hidden" name="modelo3dNome" value={modeloNovo.nome} />
          <input type="hidden" name="modelo3dTamanho" value={modeloNovo.tamanho} />
        </>
      )}
      <div className="mb-4">
        <Label htmlFor="modelo3d">{modeloExistente ? "Substituir modelo 3D" : "Anexar modelo 3D"}</Label>
        <Input
          id="modelo3d"
          type="file"
          accept=".stl,.obj,.3mf,.gltf,.glb,.fbx,.ply,.dae"
          disabled={enviandoModelo}
          onChange={onModeloChange}
        />
        {enviandoModelo && <UploadingBadge texto="Enviando modelo 3D..." />}
        {modeloNovo && !enviandoModelo && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{modeloNovo.nome} pronto pra salvar.</p>
        )}
        <FieldError message={erroModelo ?? undefined} />
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

      {extras.length > 0 && (
        <div className="mb-3 space-y-2">
          {extras.map((extra) => (
            <div key={extra.clientId} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <Label>Insumo adicional</Label>
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
              </div>
              <NumField label="Peso desse insumo (g)" value={extra.pesoG} onChange={(v) => updateExtra(extra.clientId, { pesoG: v })} />
              <button
                type="button"
                onClick={() => removeExtra(extra.clientId)}
                aria-label="Remover insumo adicional"
                className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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
      </fieldset>

      <FieldError message={state?.erro} />

      {!readOnly && (enviandoFoto || enviandoModelo) && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
          <Loader2 size={14} className="animate-spin" />
          Aguarde o upload terminar antes de salvar.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? "Fechar" : "Cancelar"}
          </Button>
        )}
        {!readOnly && (
          <Button type="submit" disabled={pending || enviandoFoto || enviandoModelo}>
            {pending ? "Salvando..." : enviandoFoto || enviandoModelo ? "Aguarde o upload..." : "Salvar"}
          </Button>
        )}
      </div>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
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
      <NumberInput name={name} value={value} onChange={onChange} />
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

function UploadingBadge({ texto }: { texto: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 rounded-md bg-[var(--accent)]/10 px-2.5 py-1.5 text-sm font-semibold text-[var(--accent)]">
      <Loader2 size={14} className="animate-spin" />
      {texto}
    </p>
  );
}
