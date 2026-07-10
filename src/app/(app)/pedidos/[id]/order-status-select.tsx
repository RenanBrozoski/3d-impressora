"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setOrderStatus } from "@/app/actions/orders";
import { ORDER_STATUS_LABEL } from "@/lib/status";

export function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  function aplicar() {
    if (value === status) return;
    startTransition(() => setOrderStatus(id, value as never));
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onChange={(e) => setValue(e.target.value)} className="w-auto">
        {Object.entries(ORDER_STATUS_LABEL).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </Select>
      <Button variant="outline" disabled={pending || value === status} onClick={aplicar}>
        Alterar status
      </Button>
    </div>
  );
}
