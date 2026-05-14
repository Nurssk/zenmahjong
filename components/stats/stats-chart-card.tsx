import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BreakdownPoint } from "@/src/lib/stats/stats-types";

export function StatsChartCard({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-primary/15 bg-card/80 p-4 shadow-glass backdrop-blur-xl md:p-5", className)}>
      <div className="mb-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-xl font-black uppercase tracking-[0.04em] text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function BreakdownBars({ items, tone = "orange" }: { items: BreakdownPoint[]; tone?: "orange" | "purple" }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-foreground">{item.label}</span>
            <span className={cn("font-bold", tone === "purple" ? "text-purple-energy" : "text-primary")}>
              {item.value} · {item.percentage}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                tone === "purple"
                  ? "bg-gradient-to-r from-purple-energy to-primary"
                  : "bg-gradient-to-r from-primary to-orange-glow",
              )}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
