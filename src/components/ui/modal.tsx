"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative w-full ${widthClassName} max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg dark:bg-neutral-900`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
