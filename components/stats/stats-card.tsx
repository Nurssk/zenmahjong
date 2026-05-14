import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "orange",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "orange" | "purple";
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-primary/15 bg-card/82 p-4 shadow-glass backdrop-blur-xl md:p-5">
      <div
        className={cn(
          "absolute -right-8 -top-8 size-24 rounded-full blur-3xl",
          accent === "purple" ? "bg-purple-energy/20" : "bg-primary/18",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 break-words font-display text-2xl font-black tracking-[0.03em] text-foreground md:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg border shadow-[0_10px_30px_rgba(0,0,0,0.2)]",
            accent === "purple"
              ? "border-purple-energy/35 bg-purple-energy/12 text-purple-energy"
              : "border-primary/35 bg-primary/12 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="relative mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}
