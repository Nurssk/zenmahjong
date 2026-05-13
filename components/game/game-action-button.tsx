"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GameActionButton({
  icon,
  label,
  count,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex min-h-24 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-primary/20 bg-card p-4 text-center transition-all hover:border-primary/45 hover:bg-popover",
        className,
      )}
    >
      <div className="text-primary [&_svg]:size-6">{icon}</div>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xs text-muted-foreground">Осталось: {count}</span>
    </motion.button>
  );
}
