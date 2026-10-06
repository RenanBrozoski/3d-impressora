"use client";

import { useState } from "react";

interface ColorPickerProps {
  name: string;
  defaultValue?: string;
  label: string;
}

export function ColorPicker({ name, defaultValue = "#7c3aed", label }: ColorPickerProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-[var(--surface-border)] bg-transparent p-0.5"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setValue(v);
          }}
          className="w-28 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-2 py-1.5 text-sm font-mono text-neutral-900 outline-none focus:border-[var(--accent)] dark:text-white"
        />
        <div
          className="h-7 w-7 rounded-md border border-[var(--surface-border)]"
          style={{ background: value }}
        />
      </div>
    </label>
  );
}
