"use client";

import { useActionState, useEffect } from "react";
import { createCustomer, updateCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";

type CustomerData = {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
};

export function CustomerForm({
  customer,
  onSuccess,
}: {
  customer?: CustomerData;
  onSuccess: () => void;
}) {
  const action = customer ? updateCustomer : createCustomer;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {customer && <input type="hidden" name="id" value={customer.id} />}

      <div>
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" required defaultValue={customer?.nome} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone/WhatsApp</Label>
          <Input id="telefone" name="telefone" defaultValue={customer?.telefone ?? ""} />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
        <Input id="cpfCnpj" name="cpfCnpj" defaultValue={customer?.cpfCnpj ?? ""} />
      </div>

      <div>
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" name="endereco" defaultValue={customer?.endereco ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" defaultValue={customer?.cidade ?? ""} />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" name="estado" maxLength={2} defaultValue={customer?.estado ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={customer?.observacoes ?? ""} />
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
