import { cn } from "@/lib/utils";

const COLOR_CLASSES: Record<string, string> = {
  neutral: "bg-neutral-500/10 text-neutral-600 ring-neutral-500/20 dark:text-neutral-300",
  blue: "bg-blue-500/10 text-blue-600 ring-blue-500/25 dark:text-blue-300",
  yellow: "bg-yellow-500/10 text-yellow-700 ring-yellow-500/25 dark:text-yellow-300",
  green: "bg-green-500/10 text-green-600 ring-green-500/25 dark:text-green-300",
  red: "bg-red-500/10 text-red-600 ring-red-500/25 dark:text-red-300",
  purple: "bg-purple-500/10 text-purple-600 ring-purple-500/25 dark:text-purple-300",
  orange: "bg-orange-500/10 text-orange-600 ring-orange-500/25 dark:text-orange-300",
};

export function Badge({
  color = "neutral",
  children,
  className,
}: {
  color?: keyof typeof COLOR_CLASSES;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}
