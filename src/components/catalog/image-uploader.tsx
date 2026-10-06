"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, Loader2, Star, StarOff } from "lucide-react";
import { uploadCatalogItemImage, deleteCatalogItemImage, setPrimaryImage } from "@/app/actions/catalog-items";

interface UploadedImage {
  id: number;
  url: string;
  isPrimary: boolean;
  nomeOriginal?: string | null;
  altText?: string | null;
  ordem: number;
}

interface ImageUploaderProps {
  itemId: number;
  initialImages?: UploadedImage[];
}

export function ImageUploader({ itemId, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("isPrimary", images.length === 0 ? "true" : "false");

      const result = await uploadCatalogItemImage(itemId, fd);
      if ("erro" in result) {
        setError(result.erro);
        break;
      } else {
        setImages((prev) => [
          ...prev,
          { id: result.id, url: result.url, isPrimary: prev.length === 0, nomeOriginal: file.name, altText: null, ordem: prev.length },
        ]);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(imageId: number) {
    startTransition(async () => {
      const result = await deleteCatalogItemImage(imageId);
      if (result && "sucesso" in result) {
        setImages((prev) => {
          const remaining = prev.filter((i) => i.id !== imageId);
          const wasPrimary = prev.find((i) => i.id === imageId)?.isPrimary;
          if (wasPrimary && remaining.length > 0) {
            return remaining.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
          }
          return remaining;
        });
      }
    });
  }

  function handleSetPrimary(imageId: number) {
    startTransition(async () => {
      const result = await setPrimaryImage(imageId, itemId);
      if (result && "sucesso" in result) {
        setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
      }
    });
  }

  const isDragging = false;

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--surface-border)] bg-[var(--surface)] text-neutral-500 transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:text-neutral-400"
      >
        {uploading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Upload size={24} />
        )}
        <span className="text-sm">{uploading ? "Enviando..." : "Clique para adicionar imagens"}</span>
        <span className="text-xs">JPG, PNG, WebP — máx. 10MB cada</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Grid de imagens */}
      {images.length > 0 && (
        <div className={`grid grid-cols-3 gap-3 sm:grid-cols-4 ${isPending ? "opacity-60" : ""}`}>
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--surface-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-start justify-between gap-1 bg-black/0 p-1 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  title={img.isPrimary ? "Foto principal" : "Definir como principal"}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
                >
                  {img.isPrimary ? <Star size={14} className="fill-yellow-400 text-yellow-400" /> : <StarOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-red-500"
                >
                  <X size={14} />
                </button>
              </div>
              {img.isPrimary && (
                <div className="absolute bottom-0 left-0 right-0 bg-[var(--accent)] py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
