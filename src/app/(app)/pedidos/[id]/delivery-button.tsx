"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { registerDelivery } from "@/app/actions/orders";

export function DeliveryButton({ id, disabled }: { id: number; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={disabled || pending}
      onClick={() => {
        if (confirm("Confirmar entrega deste pedido?")) {
          startTransition(() => registerDelivery(id));
        }
      }}
    >
      Registrar entrega
    </Button>
  );
}
