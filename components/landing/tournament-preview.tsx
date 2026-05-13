import { leaderboardEntries } from "@/constants/product";
import { GlassPanel } from "@/components/layout/glass-panel";
import { Badge } from "@/components/ui/badge";

export function TournamentPreview() {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <Badge variant="outline" className="border-secondary/40 text-secondary">
              Ежедневный турнир
            </Badge>
            <h2 className="type-heading-xl mt-4 text-zen-gradient">
              Один сид. Одно давление. Одна мировая доска.
            </h2>
          </div>
          <p className="type-body text-muted-foreground">
            Zen Mahjong превращает короткую сессию фокуса в соревновательный
            ритуал с мировым, казахстанским, городским и дружеским рейтингом.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          {leaderboardEntries.map((entry) => (
            <div
              key={entry.displayName}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md px-3 py-3 text-sm"
            >
              <span className="font-black text-primary">#{entry.rank}</span>
              <div>
                <p className="font-semibold">{entry.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.city}, {entry.country}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{entry.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
