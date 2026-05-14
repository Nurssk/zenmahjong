"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GameActionButton({
  icon,
  label,
  onClick,
  disabled,
  active,
  hidden,
  className,
}: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  if (hidden) {
    return null;
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(
        "flex min-h-14 min-w-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-primary/20 bg-card/85 p-2 text-center shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all sm:min-w-[88px] lg:min-h-20 lg:min-w-[112px] lg:gap-2 lg:p-3",
        "hover:border-primary/45 hover:bg-popover hover:shadow-[0_0_24px_rgba(255,107,53,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-primary/20 disabled:hover:bg-card/85 disabled:hover:shadow-[0_10px_30px_rgba(0,0,0,0.24)]",
        active ? "border-primary/55 bg-primary/15 text-primary shadow-[0_0_24px_rgba(255,107,53,0.24)]" : null,
        className,
      )}
    >
      {icon ? <div className="text-primary [&_svg]:size-4 lg:[&_svg]:size-5">{icon}</div> : null}
      <span className="text-[11px] font-bold leading-tight lg:text-sm">{label}</span>
    </motion.button>
  );
}
