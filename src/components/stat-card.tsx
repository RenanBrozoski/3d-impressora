"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  accent = "violet",
  index = 0,
  className,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: "violet" | "green" | "red" | "blue" | "yellow";
  index?: number;
  className?: string;
}) {
  const accentClasses: Record<string, string> = {
    violet: "from-[var(--accent)] to-[var(--accent-2)]",
    green: "from-emerald-500 to-teal-400",
    red: "from-rose-500 to-red-400",
    blue: "from-blue-500 to-cyan-400",
    yellow: "from-amber-500 to-yellow-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="card relative overflow-hidden p-4"
    >
      <div
        className={cn(
          "absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 blur-xl",
          accentClasses[accent]
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        {icon && (
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-white", accentClasses[accent])}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn("mt-1 text-xl font-semibold text-neutral-900 dark:text-white", className)}>{value}</p>
    </motion.div>
  );
}
