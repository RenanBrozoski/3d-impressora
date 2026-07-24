"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { deleteCustomer } from "@/app/actions/customers";

export function CustomerDeleteButton({ id, nome }: { id: number; nome: string }) {
  const router = useRouter();

  return (
    <DeleteButton
      label="Excluir"
      confirmMessage={`Excluir o cliente "${nome}" permanentemente? Essa ação não pode ser desfeita.`}
      action={async () => {
        const result = await deleteCustomer(id);
        if (result?.ok) router.push("/clientes");
        return result;
      }}
    />
  );
}
