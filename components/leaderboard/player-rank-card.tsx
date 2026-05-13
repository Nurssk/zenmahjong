import { Card, CardContent } from "@/components/ui/card";

export function PlayerRankCard() {
  return (
    <Card>
      <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Казахстан</p>
          <p className="text-2xl font-black">#2</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Павлодар</p>
          <p className="text-2xl font-black">#1</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Лучшее время</p>
          <p className="text-2xl font-black">02:14</p>
        </div>
      </CardContent>
    </Card>
  );
}
