"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
        Algo deu errado
      </h2>
      <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        {error.message || "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-neutral-400">ID: {error.digest}</p>
      )}
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
