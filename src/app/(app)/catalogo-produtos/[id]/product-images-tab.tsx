"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadCatalogItemImage,
  deleteCatalogItemImage,
  setPrimaryImage,
} from "@/app/actions/catalog-items";
import { SortableList } from "@/components/catalog/sortable-list";
import { reorderItemImages } from "@/app/actions/catalog-items";

interface ItemImage {
  id: number;
  url: string;
  nomeOriginal: string | null;
  altText: string | null;
  isPrimary: boolean;
  ordem: number;
}

interface ProductImagesTabProps {
  itemId: number;
  images: ItemImage[];
}

export function ProductImagesTab({ itemId, images }: ProductImagesTabProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCatalogItemImage(itemId, fd);
    setUploading(false);
    if ("erro" in result) alert(result.erro);
    else router.refresh();
    // Reset input
    e.target.value = "";
  }

  function handleSetPrimary(imageId: number) {
    setSettingPrimaryId(imageId);
    startTransition(async () => {
      await setPrimaryImage(imageId, itemId);
      setSettingPrimaryId(null);
      router.refresh();
    });
  }

  function handleDelete(imageId: number) {
    setDeletingId(imageId);
    startTransition(async () => {
      await deleteCatalogItemImage(imageId);
      setDeletingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-[var(--surface-border)] p-4 text-sm text-neutral-500 transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:text-neutral-400">
        <Upload size={18} />
        {uploading ? "Enviando imagem..." : "Clique para fazer upload de uma imagem"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={handleUpload}
        />
      </label>

      {images.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Nenhuma imagem cadastrada.
        </p>
      ) : (
        <SortableList
          items={images}
          onReorder={(ids) => reorderItemImages(ids)}
          renderItem={(img) => (
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? img.nomeOriginal ?? ""}
                className="h-14 w-14 shrink-0 rounded-lg border border-[var(--surface-border)] object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-700 dark:text-neutral-300">
                  {img.nomeOriginal ?? img.url.split("/").pop()}
                </p>
                {img.isPrimary && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                    <Star size={11} fill="currentColor" />
                    Imagem principal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!img.isPrimary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Definir como principal"
                    disabled={pending && settingPrimaryId === img.id}
                    onClick={() => handleSetPrimary(img.id)}
                    title="Definir como imagem principal"
                  >
                    <Star size={15} />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Excluir imagem"
                  disabled={pending && deletingId === img.id}
                  onClick={() => handleDelete(img.id)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
