import Link from "next/link";
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
  const label = type === "coins" ? "Открыть магазин монет" : "Открыть магазин самоцветов";

  return (
    <Link
      href="/shop"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-popover px-4 py-2 text-sm font-bold transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:gap-2",
        type === "coins" ? "border-primary/30" : "border-purple-energy/30",
        type === "coins"
          ? "hover:border-primary/55 hover:shadow-[0_0_24px_rgba(255,107,53,0.28)]"
          : "hover:border-purple-energy/55 hover:shadow-[0_0_24px_rgba(108,99,255,0.26)]",
        className,
      )}
    >
      <Icon className={cn("size-4 md:size-5", type === "coins" ? "text-gold" : "text-purple-energy")} fill="currentColor" />
      <span className="max-[360px]:sr-only">{currencyFormatter.format(value)}</span>
    </Link>
  );
}
