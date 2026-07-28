import { Box } from "lucide-react";
import { db } from "@/lib/db";
import { AnimatedBackground } from "@/components/animated-background";
import { PrintCubeGate } from "@/components/print-cube-gate";
import { LoginCard } from "./login-card";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const settings = await db.settings.findUnique({ where: { id: 1 }, select: { nomeLoja: true, logoPath: true } });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AnimatedBackground intensity="hero" />

      <div className="flex w-full max-w-4xl items-center justify-center gap-8">
        <PrintCubeGate minWidth={1024} size={380} className="shrink-0" />

        <LoginCard>
          <div className="mb-6 flex items-center gap-3">
            {settings?.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/api/logo"
                alt={settings.nomeLoja}
                className="h-11 w-11 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_8px_24px_-6px_var(--ring)]">
                <Box size={22} className="text-white" strokeWidth={2.5} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {settings?.nomeLoja ?? "Impressão 3D"}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Gestão da operação</p>
            </div>
          </div>
          <LoginForm />
        </LoginCard>
      </div>
    </div>
  );
}
