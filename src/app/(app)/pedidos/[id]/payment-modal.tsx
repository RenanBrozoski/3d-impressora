"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { registerPayment } from "@/app/actions/orders";

export function PaymentModal({ orderId, valorPendente }: { orderId: number; valorPendente: number }) {
  const [open, setOpen] = useState(false);
  const action = registerPayment.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={valorPendente <= 0}>
        Registrar pagamento
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar pagamento">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input id="valor" name="valor" type="number" step="0.01" max={valorPendente} required />
          </div>
          <div>
            <Label htmlFor="data">Data</Label>
            <Input id="data" name="data" type="date" />
          </div>
          <div>
            <Label htmlFor="formaPagamento">Forma de pagamento</Label>
            <Input id="formaPagamento" name="formaPagamento" placeholder="Pix, cartão, dinheiro..." />
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" name="observacoes" rows={2} />
          </div>
          <FieldError message={state?.erro} />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar pagamento"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
