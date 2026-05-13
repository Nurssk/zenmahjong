"use client";

import { cn } from "@/lib/utils";

const symbols = ["🀀", "🀁", "🀂", "🀃", "🀄", "🀅", "🀆"];

export function MahjongTile({
  index,
  selected,
  compact,
}: {
  index: number;
  selected?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group relative grid aspect-[3/4] place-items-center rounded-lg border font-bold transition-all hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        compact ? "w-9 text-lg sm:w-11 md:w-12 md:text-xl" : "w-9 text-lg sm:w-12 md:w-14 md:text-2xl",
        selected
          ? "border-2 border-gold bg-zen-cta text-primary-foreground shadow-[0_0_20px_rgba(255,136,0,0.5)]"
          : "border-primary/20 bg-gradient-to-br from-muted to-secondary text-foreground hover:border-primary/60",
      )}
    >
      {selected ? <span className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" /> : null}
      <span className="relative">{symbols[index % symbols.length]}</span>
    </button>
  );
}
