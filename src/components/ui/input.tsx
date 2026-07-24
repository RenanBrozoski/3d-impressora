"use client";

import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "glow-ring w-full rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 [color-scheme:light] focus:border-[var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500 dark:[color-scheme:dark] dark:focus:border-[var(--accent)]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

function parseDecimal(texto: string): number {
  const n = Number(texto.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatarNumero(value: number): string {
  return value ? String(value).replace(".", ",") : "";
}

/**
 * Campo numérico que aceita tanto "," quanto "." como separador decimal.
 * `type="number"` nativo do navegador rejeita a vírgula em alguns locales,
 * o que impedia digitar valores como "0,5" nessas máquinas.
 */
export function NumberInput({
  value,
  onChange,
  className,
  name,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  name?: string;
}) {
  const [texto, setTexto] = useState(() => formatarNumero(value));

  useEffect(() => {
    if (parseDecimal(texto) !== value) setTexto(formatarNumero(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      name={name}
      className={cn(fieldClasses, className)}
      value={texto}
      onChange={(e) => {
        const raw = e.target.value;
        if (!/^-?\d*[.,]?\d*$/.test(raw)) return;
        setTexto(raw);
        onChange(parseDecimal(raw));
      }}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300", className)}
      {...props}
    />
  );
}

export function Hint({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex shrink-0 text-neutral-400 dark:text-neutral-500">
      <HelpCircle size={13} />
    </span>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{message}</p>;
}
