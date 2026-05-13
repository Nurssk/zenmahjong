import { leaderboardEntries } from "@/constants/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LeaderboardTable() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-premium">
      <CardContent className="p-3">
        <div className="hidden grid-cols-[64px_1fr_120px_120px_120px] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground md:grid">
          <span>Ранг</span>
          <span>Игрок</span>
          <span>Очки</span>
          <span>Время</span>
          <span>Серия</span>
        </div>
        {leaderboardEntries.map((entry) => (
          <div
            key={entry.displayName}
            className={cn(
              "grid gap-3 rounded-xl border border-transparent px-3 py-4 text-sm transition md:grid-cols-[64px_1fr_120px_120px_120px]",
              entry.isCurrentUser
                ? "border-primary/45 bg-primary/15 shadow-ember"
                : "hover:border-primary/20 hover:bg-popover/60",
            )}
          >
            <span className="font-black text-primary">#{entry.rank}</span>
            <div>
              <p className="font-bold">{entry.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {entry.city}, {entry.country}
              </p>
            </div>
            <span className="font-semibold">{entry.score.toLocaleString()}</span>
            <span className="font-semibold">{entry.time}</span>
            <Badge variant="muted" className="w-fit">
              {entry.streak} побед
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
