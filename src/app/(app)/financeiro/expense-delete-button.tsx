"use client";

import { DeleteButton } from "@/components/delete-button";
import { deleteExpense } from "@/app/actions/expenses";

export function ExpenseDeleteButton({ id, descricao }: { id: number; descricao: string }) {
  return (
    <DeleteButton
      action={() => deleteExpense(id)}
      confirmMessage={`Excluir a despesa "${descricao}"? Essa ação não pode ser desfeita.`}
    />
  );
}
