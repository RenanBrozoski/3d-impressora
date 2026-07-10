"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="mt-4 text-sm text-neutral-500 underline print:hidden">
      Imprimir / gerar PDF
    </button>
  );
}
