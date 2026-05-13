"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Trophy } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import {
  loadGameDashboardSummary,
  type GameDashboardSummary as GameDashboardSummaryData,
} from "@/src/lib/game-save";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function GameSaveSummary() {
  const { user, loading } = useAuth();
  const [summary, setSummary] = useState<GameDashboardSummaryData | null>(null);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setSummary(null);
      setSyncing(false);
      return;
    }

    let cancelled = false;
    setSyncing(true);

    loadGameDashboardSummary(user.uid)
      .then((nextSummary) => {
        if (!cancelled) {
          setSummary(nextSummary);
        }
      })
      .catch((error) => {
        console.warn("Failed to load Zen Mahjong dashboard saves:", error);

        if (!cancelled) {
          setSummary(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSyncing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (syncing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Сохранения</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Синхронизируем прогресс...</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const saveProgress = summary.currentSave
    ? Math.round((summary.currentSave.removedTileIds.length / Math.max(1, summary.currentSave.tiles.length)) * 100)
    : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      {summary.currentSave ? (
        <Link
          href="/game"
          className="group rounded-xl border border-primary/25 bg-gradient-to-br from-card to-popover p-5 transition hover:border-primary/50"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Незавершённая партия</p>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.06em]">
                Продолжить игру
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatTime(summary.currentSave.elapsedSeconds)} · {summary.currentSave.score} очков ·{" "}
                {difficultyLabel(summary.currentSave.difficulty)}
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition group-hover:scale-105">
              <Play fill="currentColor" />
            </span>
          </div>
          <Progress value={saveProgress} className="mt-5" />
          <p className="mt-2 text-xs text-muted-foreground">{saveProgress}% доски собрано</p>
        </Link>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Продолжить игру</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Незавершённых партий пока нет.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-primary" />
            Рекорды
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-popover p-3">
            <p className="text-xs text-muted-foreground">Лучший счёт</p>
            <p className="mt-1 text-xl font-black text-primary">{summary.bestScore || "—"}</p>
          </div>
          <div className="rounded-lg bg-popover p-3">
            <p className="text-xs text-muted-foreground">Лучшее время</p>
            <p className="mt-1 text-xl font-black text-primary">
              {summary.fastestTime === null ? "—" : formatTime(summary.fastestTime)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function difficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    easy: "Лёгкий",
    medium: "Средний",
    hard: "Сложный",
  };

  return labels[difficulty] ?? "Классика";
}
