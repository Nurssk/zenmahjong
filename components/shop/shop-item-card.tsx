import type { LucideIcon } from "lucide-react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rarityClasses = {
  common: "border-zinc-500/30 before:from-zinc-500/20",
  rare: "border-blue-500/30 before:from-blue-500/20",
  epic: "border-purple-energy/40 before:from-purple-energy/25",
  legendary: "border-primary/40 before:from-primary/25",
};

export function ShopItemCard({
  title,
  description,
  price,
  currency,
  rarity,
  icon: Icon,
}: {
  title: string;
  description: string;
  price: string | number;
  currency: "coin" | "gem";
  rarity: keyof typeof rarityClasses;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all before:absolute before:inset-0 before:bg-gradient-to-b before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
        rarityClasses[rarity],
      )}
    >
      <div className="relative">
        <div className="mb-3 grid aspect-square place-items-center rounded-lg border border-primary/15 bg-gradient-to-br from-popover to-background-mid">
          {Icon ? <Icon className="size-10 text-primary" /> : <span className="text-4xl">🀄</span>}
        </div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 font-bold">
            {price}
            {currency === "coin" ? (
              <span className="size-4 rounded-full bg-gradient-to-br from-gold to-orange-glow" />
            ) : (
              <Star className="text-purple-energy" fill="currentColor" />
            )}
          </div>
          <Button size="sm">Купить</Button>
        </div>
      </div>
    </div>
  );
}
