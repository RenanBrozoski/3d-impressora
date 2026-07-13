"use client";

import { useActionState, useEffect } from "react";
import { createUser, updateUser } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";

type UserData = {
  id: number;
  nome: string;
  email: string;
  username: string | null;
  papel: string;
  valorHora: number | null;
  ativo: boolean;
};

export function UserForm({ user, onSuccess }: { user?: UserData; onSuccess: () => void }) {
  const action = user ? updateUser.bind(null, user.id) : createUser;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" required defaultValue={user?.nome} />
      </div>

      {!user && (
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      )}

      <div>
        <Label htmlFor="username">Usuário (login alternativo ao e-mail)</Label>
        <Input id="username" name="username" defaultValue={user?.username ?? ""} placeholder="ex: admin" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="papel">Papel *</Label>
          <Select id="papel" name="papel" defaultValue={user?.papel ?? "OPERADOR"} required>
            <option value="ADMIN">Administrador</option>
            <option value="OPERADOR">Operador</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="valorHora">Valor/hora (mão de obra)</Label>
          <Input id="valorHora" name="valorHora" type="number" step="0.01" defaultValue={user?.valorHora ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor={user ? "novaSenha" : "senha"}>{user ? "Nova senha (opcional)" : "Senha *"}</Label>
        <Input id={user ? "novaSenha" : "senha"} name={user ? "novaSenha" : "senha"} type="password" required={!user} />
      </div>

      {user && (
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input type="checkbox" name="ativo" defaultChecked={user.ativo} className="h-4 w-4" />
          Usuário ativo
        </label>
      )}

      <FieldError message={state?.erro} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
