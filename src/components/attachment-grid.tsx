"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";
import { ModelViewer, isModelo3DVisualizavel } from "./model-viewer";

type AttachmentData = { id: number; nomeArquivo: string; caminho: string };

export function AttachmentGrid({ attachments }: { attachments: AttachmentData[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  if (attachments.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhum arquivo anexado.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((a) => {
        const url = `/api/uploads/${encodeURIComponent(a.caminho)}`;
        const visualizavel = isModelo3DVisualizavel(a.nomeArquivo);
        const estaAberto = aberto === a.id;

        return (
          <div key={a.id} className="card p-3">
            <div className="flex items-center justify-between gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-neutral-700 hover:underline dark:text-neutral-300"
              >
                {a.nomeArquivo}
              </a>
              <div className="flex shrink-0 items-center gap-1">
                {visualizavel && (
                  <button
                    type="button"
                    onClick={() => setAberto(estaAberto ? null : a.id)}
                    aria-label="Visualizar modelo 3D"
                    className="rounded-md p-1.5 text-neutral-400 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Baixar arquivo"
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
            {estaAberto && visualizavel && (
              <ModelViewer url={url} nomeArquivo={a.nomeArquivo} height={260} className="mt-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}
