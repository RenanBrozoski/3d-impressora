"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setClientRequestStatus, convertRequestToQuote } from "@/app/actions/client-requests";

export function RequestActions({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | undefined>();

  function run(action: () => Promise<void>) {
    setErro(undefined);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") setErro(err.message);
      }
    });
  }

  if (status === "CONVERTIDO" || status === "DESCARTADO") return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
      {status === "NOVO" && (
        <Button variant="outline" disabled={pending} onClick={() => run(() => setClientRequestStatus(id, "EM_ANALISE"))}>
          Marcar em análise
        </Button>
      )}
      <Button variant="danger" disabled={pending} onClick={() => run(() => setClientRequestStatus(id, "DESCARTADO"))}>
        Descartar
      </Button>
      <Button disabled={pending} onClick={() => run(() => convertRequestToQuote(id))}>
        Converter em orçamento
      </Button>
    </div>
  );
}
