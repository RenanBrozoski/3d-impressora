import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function whatsappLink(telefone: string) {
  const digits = telefone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}

export function formatNumber(value: number, maxDecimals = 3) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: maxDecimals }).format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value)
  );
}
