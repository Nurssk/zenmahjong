import Link from "next/link";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ShopPreview() {
  return (
    <Card>
      <CardHeader>
        <Gem className="text-secondary" />
        <CardTitle>Магазин</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Монеты, самоцветы, тренеры, скины доски, расходники и наборы готовы
          для демонстрации инвесторам.
        </p>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href="/shop">Открыть магазин</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
