import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "glow-ring w-full rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 [color-scheme:light] focus:border-[var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500 dark:[color-scheme:dark] dark:focus:border-[var(--accent)]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
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

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{message}</p>;
}
