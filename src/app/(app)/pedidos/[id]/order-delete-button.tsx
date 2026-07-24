"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { deleteOrder } from "@/app/actions/orders";

export function OrderDeleteButton({ id, numero }: { id: number; numero: string }) {
  const router = useRouter();

  return (
    <DeleteButton
      label="Excluir"
      confirmMessage={`Excluir o pedido "${numero}" permanentemente? Essa ação não pode ser desfeita.`}
      action={async () => {
        const result = await deleteOrder(id);
        if (result?.ok) router.push("/pedidos");
        return result;
      }}
    />
  );
}
