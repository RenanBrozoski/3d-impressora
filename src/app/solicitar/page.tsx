import { db } from "@/lib/db";
import { SolicitarForm } from "./solicitar-form";

export default async function SolicitarPage() {
  const settings = await db.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">
          {settings?.nomeLoja ?? "Impressão 3D"}
        </h1>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          Conte pra gente o que você precisa imprimir e retornaremos com um orçamento.
        </p>
        <SolicitarForm />
      </div>
    </div>
  );
}
