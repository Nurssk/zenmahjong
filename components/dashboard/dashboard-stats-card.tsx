"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Clock3, Flame, Loader2, Medal, Trophy } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/src/context/AuthContext";
import { db } from "@/src/lib/firebase";
import { calculatePlayerStats } from "@/src/lib/stats/calculatePlayerStats";
import { STATS_UPDATED_EVENT } from "@/src/lib/stats/game-history-service";

type GameHistoryRecord = Record<string, unknown>;

export function DashboardStatsCard() {
  const { loading: authLoading, user } = useAuth();
  const [records, setRecords] = useState<GameHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;

    async function loadStats() {
      if (!user?.uid || !db) {
        if (!cancelled) {
          setRecords([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "gameHistory"));
        const history = snapshot.docs.map((historyDoc) => ({
          id: historyDoc.id,
          ...historyDoc.data(),
        }));

        if (!cancelled) {
          setRecords(history);
        }
      } catch {
        if (!cancelled) {
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStats();
    window.addEventListener(STATS_UPDATED_EVENT, loadStats);

    return () => {
      cancelled = true;
      window.removeEventListener(STATS_UPDATED_EVENT, loadStats);
    };
  }, [authLoading, user?.uid]);

  const stats = useMemo(() => calculatePlayerStats(records), [records]);

  return (
    <Card className="border-primary/20 bg-card/90 shadow-glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="text-primary" />
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid min-h-36 place-items-center rounded-xl border border-primary/10 bg-popover/45">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Загружаем...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Партии" value={formatNumber(stats.totalGames)} />
            <StatBox label="Победы" value={formatNumber(stats.wins)} icon={<Trophy className="size-4 text-primary" />} />
            <StatBox label="Win Rate" value={`${stats.winRate}%`} />
            <StatBox label="Лучший счёт" value={formatNumber(stats.bestScore)} icon={<Medal className="size-4 text-orange-glow" />} />
            <StatBox label="Лучшее время" value={formatDuration(stats.bestTime)} icon={<Clock3 className="size-4 text-purple-energy" />} />
            <StatBox label="Серия" value={formatNumber(stats.currentWinStreak)} icon={<Flame className="size-4 text-orange-glow" />} />
          </div>
        )}

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/stats">Подробная аналитика</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatBox({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-popover/70 p-3">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-xl font-bold text-foreground">{value}</p>
        {icon}
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("ru-RU") : "0";
}

function formatDuration(seconds: number | null) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}
