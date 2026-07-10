import { Box } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { PrintCube } from "@/components/print-cube";
import { LoginCard } from "./login-card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AnimatedBackground intensity="hero" />

      <div className="flex w-full max-w-4xl items-center justify-center gap-8">
        <div className="hidden shrink-0 lg:block">
          <PrintCube size={380} />
        </div>

        <LoginCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_8px_24px_-6px_var(--ring)]">
              <Box size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Impressão 3D</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Gestão da operação</p>
            </div>
          </div>
          <LoginForm />
        </LoginCard>
      </div>
    </div>
  );
}
