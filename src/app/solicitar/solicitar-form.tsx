"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { createClientRequest } from "@/app/actions/client-requests";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";

type ArquivoEnviado = { url: string; nome: string; tamanho: number; tipo: string };

export function SolicitarForm() {
  const [state, formAction, pending] = useActionState(createClientRequest, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [arquivos, setArquivos] = useState<ArquivoEnviado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  async function onArquivosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setErroUpload(null);
    setEnviando(true);
    try {
      const enviados = await Promise.all(
        files.map(async (file) => {
          const blob = await upload(file.name, file, {
            access: "private",
            handleUploadUrl: "/api/blob-upload-publico",
          });
          return { url: blob.url, nome: file.name, tamanho: file.size, tipo: file.type };
        }),
      );
      setArquivos((atual) => [...atual, ...enviados]);
    } catch (err) {
      setErroUpload(err instanceof Error ? err.message : "Falha ao enviar arquivo.");
    } finally {
      setEnviando(false);
    }
  }

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950">
        <p className="font-medium text-green-800 dark:text-green-300">Solicitação enviada com sucesso!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Entraremos em contato em breve com um orçamento.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone/WhatsApp</Label>
          <Input id="telefone" name="telefone" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">O que você precisa?</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={4}
          placeholder="Descreva a peça, quantidade, cor desejada, prazo, etc."
        />
      </div>

      <div>
        <Label htmlFor="arquivos">Arquivo 3D (STL, OBJ, 3MF) ou imagens de referência</Label>
        <Input
          id="arquivos"
          type="file"
          multiple
          accept=".stl,.obj,.3mf,.gltf,.glb,.fbx,.ply,.dae,.gcode,image/*,.pdf"
          disabled={enviando}
          onChange={onArquivosChange}
        />
        {enviando && (
          <p className="mt-2 flex items-center gap-1.5 rounded-md bg-[var(--accent)]/10 px-2.5 py-1.5 text-sm font-semibold text-[var(--accent)]">
            <Loader2 size={14} className="animate-spin" />
            Enviando arquivo...
          </p>
        )}
        {!enviando && arquivos.length > 0 && (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {arquivos.length === 1 ? "1 arquivo pronto" : `${arquivos.length} arquivos prontos`}: {arquivos.map((a) => a.nome).join(", ")}
          </p>
        )}
        <FieldError message={erroUpload ?? undefined} />
      </div>

      <input type="hidden" name="arquivosJson" value={JSON.stringify(arquivos)} />

      <FieldError message={state?.erro} />

      {enviando && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
          <Loader2 size={14} className="animate-spin" />
          Aguarde o envio do arquivo terminar antes de enviar.
        </p>
      )}

      <Button type="submit" disabled={pending || enviando} className="w-full">
        {pending ? "Enviando..." : enviando ? "Aguarde o upload..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
