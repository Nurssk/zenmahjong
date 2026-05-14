"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Play, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import { getTodayKey } from "@/src/lib/game";
import {
  DailyLeaderboardIndexError,
  getUserDailyRank,
  type DailyLeaderboardEntry,
} from "@/src/lib/tournament/leaderboard";

export function DailyTournamentCard() {
  const { user } = useAuth();
  const dateKey = useMemo(() => getTodayKey(), []);
  const [entry, setEntry] = useState<DailyLeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      if (!user) {
        setEntry(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const result = await getUserDailyRank(dateKey, user.uid);

        if (!cancelled) {
          setEntry(result);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.warn("Failed to load dashboard tournament rank:", error);
        setEntry(null);
        setErrorMessage(
          error instanceof DailyLeaderboardIndexError ? "Нужен индекс Firestore" : "Рейтинг временно недоступен",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [dateKey, user]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-6 text-left shadow-[0_14px_44px_rgba(0,0,0,0.24)] transition-all hover:border-primary/40 hover:bg-popover">
      <div className="absolute right-4 top-4 rounded bg-red-aura px-2 py-1 text-xs font-bold">Идет</div>
      <div className="mb-3 text-primary">
        <Trophy className="size-6" />
      </div>
      <h3 className="mb-1 font-bold">Ежедневный турнир</h3>
      {loading ? (
        <p className="text-sm text-muted-foreground">Загружаем результат...</p>
      ) : entry ? (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Ваш результат: <span className="font-bold text-foreground">{entry.score.toLocaleString("ru-RU")} очков</span>
          </p>
          <p className="text-muted-foreground">
            Место: <span className="font-bold text-primary">#{entry.rank}</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{errorMessage ?? "Одна раскладка дня для всех игроков"}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/tournament">
            <Play className="size-4" />
            Играть турнир
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/leaderboard">
            <BarChart3 className="size-4" />
            Рейтинг
          </Link>
        </Button>
      </div>
    </div>
  );
}
