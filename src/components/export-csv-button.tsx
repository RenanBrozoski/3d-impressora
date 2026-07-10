"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCsvButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
}: {
  data: T[];
  columns: { key: keyof T; label: string }[];
  filename: string;
}) {
  function exportar() {
    const header = columns.map((c) => c.label).join(";");
    const rows = data.map((row) => columns.map((c) => String(row[c.key] ?? "")).join(";"));
    const csv = [header, ...rows].join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportar}>
      <Download size={14} />
      Exportar CSV
    </Button>
  );
}
