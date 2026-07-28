"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Hint } from "@/components/ui/input";

type SettingsData = {
  nomeLoja: string;
  logoPath: string | null;
  contatoTelefone: string | null;
  contatoEmail: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
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
  const [removerLogo, setRemoverLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [erroLogo, setErroLogo] = useState<string | null>(null);

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroLogo(null);
    setRemoverLogo(false);
    setLogoPreview(URL.createObjectURL(file));
    setEnviandoLogo(true);
    try {
      const blob = await upload(file.name, file, { access: "private", handleUploadUrl: "/api/blob-upload" });
      setLogoUrl(blob.url);
    } catch (err) {
      setErroLogo(err instanceof Error ? err.message : "Falha ao enviar a logo.");
      setLogoPreview(null);
    } finally {
      setEnviandoLogo(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-4">
        <h2 className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Dados do negócio</h2>

        <div className="mb-4">
          <Label>Logo da loja</Label>
          <div className="mt-1 flex items-center gap-3">
            {logoPreview || (settings.logoPath && !removerLogo) ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview ?? "/api/logo"}
                  alt="Logo da loja"
                  className="h-16 w-16 rounded-lg border border-[var(--surface-border)] object-contain bg-white/50 dark:bg-white/5"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRemoverLogo(true);
                    setLogoPreview(null);
                    setLogoUrl(null);
                  }}
                >
                  Remover
                </Button>
              </>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhuma logo anexada ainda.</p>
            )}
          </div>
          <input type="hidden" name="removerLogo" value={removerLogo ? "1" : ""} />
          {logoUrl && <input type="hidden" name="logoUrl" value={logoUrl} />}
          <Input
            className="mt-2"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            disabled={enviandoLogo}
            onChange={onLogoChange}
          />
          {enviandoLogo && (
            <p className="mt-2 flex items-center gap-1.5 rounded-md bg-[var(--accent)]/10 px-2.5 py-1.5 text-sm font-semibold text-[var(--accent)]">
              <Loader2 size={14} className="animate-spin" />
              Enviando logo...
            </p>
          )}
          <FieldError message={erroLogo ?? undefined} />
        </div>

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
        <h2 className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Redes sociais</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="(11) 91234-5678" defaultValue={settings.whatsapp ?? ""} />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              placeholder="https://instagram.com/sualoja"
              defaultValue={settings.instagramUrl ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input
              id="facebookUrl"
              name="facebookUrl"
              placeholder="https://facebook.com/sualoja"
              defaultValue={settings.facebookUrl ?? ""}
            />
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

      {enviandoLogo && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
          <Loader2 size={14} className="animate-spin" />
          Aguarde o upload da logo terminar antes de salvar.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || enviandoLogo}>
          {pending ? "Salvando..." : enviandoLogo ? "Aguarde o upload..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
