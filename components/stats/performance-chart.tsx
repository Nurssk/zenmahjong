import { cn } from "@/lib/utils";
import type { ScoreTrendPoint, WeeklyActivityPoint } from "@/src/lib/stats/stats-types";

export function PerformanceChart({
  scoreTrend,
  weeklyActivity,
}: {
  scoreTrend: ScoreTrendPoint[];
  weeklyActivity: WeeklyActivityPoint[];
}) {
  const maxScore = Math.max(1, ...scoreTrend.map((point) => point.score));
  const maxGames = Math.max(1, ...weeklyActivity.map((point) => point.games));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-2xl border border-primary/15 bg-card/80 p-4 shadow-premium">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Динамика очков</p>
          <h3 className="mt-1 text-xl font-black">Последние сессии</h3>
        </div>
        <div className="flex h-72 min-w-0 items-end gap-2 rounded-xl border border-primary/10 bg-black/18 p-3 sm:gap-3 sm:p-4">
          {scoreTrend.map((point) => (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-56 w-full items-end">
                <div
                  className={cn(
                    "w-full min-w-0 rounded-t-lg shadow-[0_0_22px_rgba(255,136,0,0.18)]",
                    point.result === "won" ? "bg-gradient-to-t from-primary to-gold" : null,
                    point.result === "lost" ? "bg-gradient-to-t from-red-aura/65 to-primary/70" : null,
                    point.result === "unfinished" ? "bg-gradient-to-t from-purple-energy/60 to-primary/60" : null,
                  )}
                  style={{ height: `${Math.max(8, Math.round((point.score / maxScore) * 100))}%` }}
                  title={`${point.score.toLocaleString("ru-RU")} очков`}
                />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground sm:text-xs">{point.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/15 bg-card/80 p-4 shadow-premium">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-energy">Победы</p>
          <h3 className="mt-1 text-xl font-black">Активность недели</h3>
        </div>
        <div className="grid h-72 min-w-0 grid-cols-7 items-end gap-2 rounded-xl border border-primary/10 bg-black/18 p-3 sm:gap-3 sm:p-4">
          {weeklyActivity.map((point) => (
            <div key={point.day} className="flex min-w-0 flex-col items-center justify-end gap-2">
              <div className="flex h-48 w-full items-end justify-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-purple-energy to-primary/80"
                  style={{ height: `${Math.max(6, Math.round((point.games / maxGames) * 100))}%` }}
                  title={`${point.games} игр`}
                />
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-gold"
                  style={{ height: `${point.wins === 0 ? 0 : Math.max(6, Math.round((point.wins / maxGames) * 100))}%` }}
                  title={`${point.wins} побед`}
                />
              </div>
              <span className="truncate text-[10px] font-bold text-muted-foreground sm:text-xs">{point.day}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
