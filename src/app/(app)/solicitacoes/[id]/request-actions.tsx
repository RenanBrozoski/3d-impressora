"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { setClientRequestStatus, convertRequestToQuote, deleteClientRequest } from "@/app/actions/client-requests";

export function RequestActions({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | undefined>();
  const router = useRouter();

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
      {status === "NOVO" && (
        <Button variant="outline" disabled={pending} onClick={() => run(() => setClientRequestStatus(id, "EM_ANALISE"))}>
          Marcar em análise
        </Button>
      )}
      {status !== "CONVERTIDO" && status !== "DESCARTADO" && (
        <Button variant="danger" disabled={pending} onClick={() => run(() => setClientRequestStatus(id, "DESCARTADO"))}>
          Descartar
        </Button>
      )}
      {status !== "CONVERTIDO" && (
        <Button disabled={pending} onClick={() => run(() => convertRequestToQuote(id))}>
          Converter em orçamento
        </Button>
      )}
      <DeleteButton
        label="Excluir"
        action={async () => {
          const result = await deleteClientRequest(id);
          if (result?.ok) router.push("/solicitacoes");
          return result;
        }}
        confirmMessage="Excluir essa solicitação permanentemente? Essa ação não pode ser desfeita."
      />
    </div>
  );
}
