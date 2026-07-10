"use client";

import { useActionState, useRef } from "react";
import { createClientRequest } from "@/app/actions/client-requests";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";

export function SolicitarForm() {
  const [state, formAction, pending] = useActionState(createClientRequest, undefined);
  const formRef = useRef<HTMLFormElement>(null);

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
        <Label htmlFor="descricao">O que você precisa? *</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={4}
          required
          placeholder="Descreva a peça, quantidade, cor desejada, prazo, etc."
        />
      </div>

      <div>
        <Label htmlFor="arquivos">Arquivo 3D (STL, OBJ, 3MF) ou imagens de referência</Label>
        <Input id="arquivos" name="arquivos" type="file" multiple accept=".stl,.obj,.3mf,.gcode,image/*,.pdf" />
      </div>

      <FieldError message={state?.erro} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
