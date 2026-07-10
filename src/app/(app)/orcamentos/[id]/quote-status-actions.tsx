"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setQuoteStatus, convertQuoteToOrder } from "@/app/actions/quotes";

export function QuoteStatusActions({ id, status }: { id: number; status: string }) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

      {status === "RASCUNHO" && (
        <>
          <Link href={`/orcamentos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Button disabled={pending} onClick={() => run(() => setQuoteStatus(id, "ENVIADO"))}>
            Enviar orçamento
          </Button>
        </>
      )}

      {status === "ENVIADO" && (
        <>
          <Link href={`/orcamentos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Button variant="danger" disabled={pending} onClick={() => run(() => setQuoteStatus(id, "RECUSADO"))}>
            Recusar
          </Button>
          <Button disabled={pending} onClick={() => run(() => setQuoteStatus(id, "APROVADO"))}>
            Aprovar orçamento
          </Button>
        </>
      )}

      {status === "APROVADO" && (
        <Button disabled={pending} onClick={() => run(() => convertQuoteToOrder(id))}>
          Converter em pedido
        </Button>
      )}
    </div>
  );
}
