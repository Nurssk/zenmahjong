import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-card/85 shadow-glass backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
