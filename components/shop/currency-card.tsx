import { Coins, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CurrencyCard({
  type,
  amount,
  label,
}: {
  type: "coins" | "gems";
  amount: string;
  label: string;
}) {
  const Icon = type === "coins" ? Coins : Gem;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid size-12 place-items-center rounded-lg bg-primary/15 text-primary">
          <Icon />
        </div>
        <div>
          <p className="text-2xl font-black">{amount}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
