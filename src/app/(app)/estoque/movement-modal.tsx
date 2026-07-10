"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { registerMovement } from "@/app/actions/inventory";

export function MovementModal({ itemId }: { itemId: number }) {
  const [open, setOpen] = useState(false);
  const action = registerMovement.bind(null, itemId);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Movimentar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Movimentar estoque">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select id="tipo" name="tipo" defaultValue="ENTRADA" required>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="AJUSTE">Ajuste (define a quantidade atual)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input id="quantidade" name="quantidade" type="number" step="0.01" min="0.01" required />
          </div>
          <div>
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea id="motivo" name="motivo" rows={2} />
          </div>
          <FieldError message={state?.erro} />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
