"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "glow-ring inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white shadow-[0_4px_16px_-4px_var(--ring)] hover:shadow-[0_8px_24px_-6px_var(--ring)]",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-white/8 dark:text-white dark:hover:bg-white/14",
        outline:
          "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-white/12 dark:text-neutral-200 dark:hover:bg-white/8",
        ghost: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/8",
        danger: "bg-red-600 text-white hover:bg-red-500 shadow-[0_4px_16px_-4px_rgba(220,38,38,0.5)]",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = HTMLMotionProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
