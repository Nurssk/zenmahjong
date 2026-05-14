import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GameResult } from "@/src/lib/stats/stats-types";

const modeLabel: Record<GameResult["mode"], string> = {
  regular: "Обычная",
  daily: "Ежедневная",
  tournament: "Турнир",
};

const difficultyLabel: Record<GameResult["difficulty"], string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

const statusLabel: Record<GameResult["status"], string> = {
  won: "Победа",
  lost: "Поражение",
  unfinished: "Не завершена",
};

export function RecentGameRow({ game }: { game: GameResult }) {
  return (
    <article className="grid gap-3 rounded-xl border border-primary/12 bg-popover/55 p-3 shadow-[0_14px_35px_rgba(0,0,0,0.22)] md:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr] md:items-center md:p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={game.mode === "tournament" ? "premium" : "outline"} className="rounded-lg">
            {modeLabel[game.mode]}
          </Badge>
          <span className="text-xs font-bold text-muted-foreground">{difficultyLabel[game.difficulty]}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{formatDate(game.endedAt)}</p>
      </div>
      <Metric label="Счёт" value={game.score.toLocaleString("ru-RU")} />
      <Metric label="Время" value={formatDuration(game.timeSeconds)} />
      <Metric label="Ходы" value={game.moves.toLocaleString("ru-RU")} />
      <div className="md:text-right">
        <span
          className={cn(
            "inline-flex rounded-lg border px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em]",
            game.status === "won" ? "border-green-success/30 bg-green-success/12 text-green-success" : null,
            game.status === "lost" ? "border-red-aura/30 bg-red-aura/12 text-red-aura" : null,
            game.status === "unfinished" ? "border-purple-energy/30 bg-purple-energy/12 text-purple-energy" : null,
          )}
        >
          {statusLabel[game.status]}
        </span>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
