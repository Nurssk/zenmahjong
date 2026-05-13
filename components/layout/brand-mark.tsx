import Link from "next/link";
import { productName } from "@/constants/product";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <div className="grid size-10 place-items-center rounded-xl border border-primary/40 bg-gradient-to-br from-primary/20 to-accent/10 shadow-ember">
        <span className="text-lg font-black text-primary">禅</span>
      </div>
      <div className="leading-tight">
        <p className="bg-zen-title bg-clip-text font-display text-base font-black uppercase tracking-[0.08em] text-transparent">
          {productName}
        </p>
        <p className="text-xs text-muted-foreground">Маджонг фокуса</p>
      </div>
    </Link>
  );
}
