import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function RankingCard() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid size-12 place-items-center rounded-lg bg-primary/15 text-primary">
          <Trophy />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Сегодняшний турнирный сид</p>
          <p className="text-2xl font-black">Мир #12</p>
        </div>
      </CardContent>
    </Card>
  );
}
