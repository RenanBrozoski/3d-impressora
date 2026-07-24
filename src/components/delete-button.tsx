"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteResult = { ok?: boolean; erro?: string } | void;

export function DeleteButton({
  action,
  confirmMessage,
  label,
}: {
  action: () => Promise<DeleteResult>;
  confirmMessage: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    const result = await action();
    setPending(false);
    if (result?.erro) window.alert(result.erro);
  }

  if (label) {
    return (
      <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
        {pending ? "Excluindo..." : label}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} disabled={pending} aria-label="Excluir">
      <Trash2 size={16} />
    </Button>
  );
}
