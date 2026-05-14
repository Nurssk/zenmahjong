import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PackCard({ name, price }: { name: string; price: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="grid h-28 place-items-center rounded-lg border border-border bg-gradient-to-br from-primary/20 to-secondary/20">
          <PackageOpen className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">Монеты, самоцветы, осколки сенсеев и расходники.</p>
        </div>
        <Button variant="outline">{price}</Button>
      </CardContent>
    </Card>
  );
}
