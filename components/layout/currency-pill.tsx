import { Gem, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "inline-flex items-center gap-2 rounded-lg border bg-popover px-4 py-2 text-sm font-bold",
        type === "coins" ? "border-primary/30" : "border-purple-energy/30",
        className,
      )}
    >
      <Icon className={type === "coins" ? "text-gold" : "text-purple-energy"} fill="currentColor" />
      {value.toLocaleString()}
    </div>
  );
}
