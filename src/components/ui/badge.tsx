import { cn } from "@/lib/utils";

const COLOR_CLASSES: Record<string, string> = {
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}
