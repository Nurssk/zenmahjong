import { Gem, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("ru-RU");

export function CurrencyPill({
  type,
  value,
  className,
}: {
  type: "coins" | "gems";
  value: number;
  className?: string;
}) {
  const Icon = type === "coins" ? Coins : Gem;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border bg-popover px-4 py-2 text-sm font-bold md:gap-2",
        type === "coins" ? "border-primary/30" : "border-purple-energy/30",
        className,
      )}
    >
      <Icon className={cn("size-4 md:size-5", type === "coins" ? "text-gold" : "text-purple-energy")} fill="currentColor" />
      <span className="max-[360px]:sr-only">{currencyFormatter.format(value)}</span>
    </div>
  );
}
