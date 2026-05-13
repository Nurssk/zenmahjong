import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SkinCard({ name, price }: { name: string; price: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="h-28 rounded-lg border border-border bg-gradient-to-br from-background via-card to-primary/30" />
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">Коллекционный скин доски.</p>
        </div>
        <Button variant="outline">{price}</Button>
      </CardContent>
    </Card>
  );
}
