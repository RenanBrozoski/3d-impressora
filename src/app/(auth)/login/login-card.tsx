"use client";

import { motion } from "motion/react";

export function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card relative w-full max-w-sm !bg-[var(--surface-solid)]/90 p-8"
    >
      {children}
    </motion.div>
  );
}
