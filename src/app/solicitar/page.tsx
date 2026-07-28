import { db } from "@/lib/db";
import { AnimatedBackground } from "@/components/animated-background";
import { PrintCubeGate } from "@/components/print-cube-gate";
import { SocialLinks } from "@/components/social-links";
import { SolicitarForm } from "./solicitar-form";

export default async function SolicitarPage() {
  const settings = await db.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AnimatedBackground intensity="hero" />

      <div className="flex w-full max-w-4xl items-center justify-center gap-8">
        <PrintCubeGate minWidth={1280} size={320} className="shrink-0" />

        <div className="card relative w-full max-w-lg !bg-[var(--surface-solid)]/90 p-8">
          <div className="mb-1 flex items-center gap-3">
            {settings?.logoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/api/logo" alt={settings.nomeLoja} className="h-10 w-10 rounded-lg object-contain" />
            )}
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {settings?.nomeLoja ?? "Impressão 3D"}
            </h1>
          </div>
          <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
            Conte pra gente o que você precisa imprimir e retornaremos com um orçamento.
          </p>
          <SolicitarForm />
          <SocialLinks
            whatsapp={settings?.whatsapp}
            instagramUrl={settings?.instagramUrl}
            facebookUrl={settings?.facebookUrl}
            className="mt-6 justify-center border-t border-[var(--surface-border)] pt-4"
          />
        </div>
      </div>
    </div>
  );
}
