"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="senha" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
        />
      </div>

      {state?.erro && <p className="text-sm text-red-600 dark:text-red-400">{state.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
