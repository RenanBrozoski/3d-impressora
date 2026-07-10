"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "./user-form";

type UserData = {
  id: number;
  nome: string;
  email: string;
  papel: string;
  valorHora: number | null;
  ativo: boolean;
};

export function UsersSection({ users }: { users: UserData[] }) {
  const [novoOpen, setNovoOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);

  return (
    <div className="card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Usuários</h2>
        <Button size="sm" onClick={() => setNovoOpen(true)}>
          <Plus size={14} />
          Novo usuário
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{u.nome}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {u.email} · {u.papel === "ADMIN" ? "Administrador" : "Operador"}
                {u.valorHora != null && ` · R$ ${u.valorHora.toFixed(2)}/h`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={u.ativo ? "green" : "neutral"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
              <Button variant="ghost" size="icon" onClick={() => setEditUser(u)} aria-label="Editar usuário">
                <Pencil size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo usuário">
        <UserForm onSuccess={() => setNovoOpen(false)} />
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar usuário">
        {editUser && <UserForm user={editUser} onSuccess={() => setEditUser(null)} />}
      </Modal>
    </div>
  );
}
