import { battlePassRewards } from "@/constants/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function BattlePassTrack() {
  return (
    <div className="grid gap-4">
      {battlePassRewards.map((reward) => (
        <Card
          key={reward.level}
          className={reward.claimed ? "border-primary/45 bg-primary/10 shadow-ember" : "bg-card/80"}
        >
          <CardContent className="grid gap-4 p-5 md:grid-cols-[96px_1fr_1fr]">
            <div>
              <Badge variant={reward.claimed ? "default" : "outline"}>
                Уровень {reward.level}
              </Badge>
            </div>
            <div className="rounded-xl border border-border/70 bg-popover/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Бесплатно</p>
              <p className="mt-1 font-bold">{reward.free}</p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-zen-cta p-4 text-background shadow-ember">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-background/70">PRO Pass</p>
              <p className="mt-1 font-bold">{reward.pro}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
