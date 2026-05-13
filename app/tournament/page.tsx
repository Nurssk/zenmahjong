"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Flame, Lock, Shield, Sparkles, Trophy, Undo2, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  MahjongBoard,
  type GameWinStats,
  type MahjongBoardProgressSnapshot,
} from "@/components/game/mahjong-board";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { generateDailyTournamentLayout, getTodayKey } from "@/src/lib/game";
import {
  loadTournamentProgress,
  saveTournamentProgress,
  type TournamentSaveState,
} from "@/src/lib/tournament/tournament-save";
import { saveTournamentResult } from "@/src/lib/tournament/save-result";

function getSecondsUntilNextDailyReset() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(24, 0, 0, 0);

  return Math.max(0, Math.ceil((nextReset.getTime() - now.getTime()) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

function formatTournamentDate(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}

export default function TournamentPage() {
  const [tournamentDate, setTournamentDate] = useState(() => getTodayKey());
  const [secondsUntilReset, setSecondsUntilReset] = useState(getSecondsUntilNextDailyReset);
  const [tournamentSave, setTournamentSave] = useState<TournamentSaveState | null>(null);
  const [saveChecked, setSaveChecked] = useState(false);
  const latestSnapshotRef = useRef<MahjongBoardProgressSnapshot | null>(null);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const saveWarningShownRef = useRef(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { startMusic, stopMusic } = useSiteAudio();
  const tournamentTiles = useMemo(() => generateDailyTournamentLayout(tournamentDate), [tournamentDate]);
  const initialSnapshot = useMemo(
    () => (tournamentSave ? createSnapshotFromTournamentSave(tournamentSave) : null),
    [tournamentSave],
  );
  const resetProgress = ((86400 - secondsUntilReset) / 86400) * 100;

  const persistTournamentSnapshot = useCallback(
    (snapshot: MahjongBoardProgressSnapshot) => {
      latestSnapshotRef.current = snapshot;

      if (!user) {
        return;
      }

      const nextSave = {
        dateKey: tournamentDate,
        difficulty: "hard",
        tiles: snapshot.tiles,
        removedTileIds: snapshot.removedTileIds,
        score: snapshot.score,
        elapsedSeconds: snapshot.elapsedSeconds,
        comboMultiplier: snapshot.comboMultiplier,
        selectedTileId: snapshot.selectedTileId,
        shufflesUsed: snapshot.shufflesUsed,
        completed: snapshot.completed,
        lost: snapshot.lost,
      } as const;

      saveChainRef.current = saveChainRef.current
        .catch(() => undefined)
        .then(() => saveTournamentProgress(user.uid, tournamentDate, nextSave));

      void saveChainRef.current
        .then(() => {
          saveWarningShownRef.current = false;
        })
        .catch((error) => {
          console.warn("Failed to save Zen Mahjong tournament progress:", error);

          if (saveWarningShownRef.current) {
            return;
          }

          saveWarningShownRef.current = true;
          toast({
            title: "Турнирное сохранение недоступно",
            description: "Игра продолжается локально. Прогресс синхронизируется, когда Firestore станет доступен.",
            variant: "destructive",
          });
        });
    },
    [toast, tournamentDate, user],
  );

  const handleTournamentWin = useCallback(
    async (stats: GameWinStats) => {
      if (!user) {
        toast({
          title: "Войдите, чтобы сохранить результат",
          description: "Турнирный результат доступен только авторизованным игрокам.",
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await saveTournamentResult({
          dateKey: tournamentDate,
          uid: user.uid,
          name: user.displayName ?? user.email ?? "Игрок Zen Mahjong",
          photoURL: user.photoURL,
          score: stats.score,
          elapsedSeconds: stats.elapsedSeconds,
          movesCount: stats.movesCount,
          hintsUsed: stats.hintsUsed,
          shufflesUsed: stats.shufflesUsed,
        });

        if (result.saved) {
          toast({
            title: "Результат турнира сохранён",
            description: result.reason === "improved" ? "Новый лучший результат дня обновлён." : "Результат дня добавлен.",
          });
          return;
        }

        if (result.reason === "existing-better") {
          toast({
            title: "Лучший результат уже сохранён",
            description: "Текущая попытка не улучшила результат дня.",
          });
          return;
        }

        toast({
          title: "Не удалось сохранить турнир",
          description: "Firebase недоступен. Победа засчитана локально.",
          variant: "destructive",
        });
      } catch (error) {
        console.warn("Failed to save Zen Mahjong tournament result:", error);
        toast({
          title: "Не удалось сохранить турнир",
          description: "Победа засчитана, но результат не отправлен. Попробуйте позже.",
          variant: "destructive",
        });
      }
    },
    [toast, tournamentDate, user],
  );

  const handleTournamentLoss = useCallback(
    () => {
      toast({
        title: "Турнир завершён",
        description: "Попытка дня зафиксирована как поражение.",
      });
    },
    [toast],
  );

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user) {
      setTournamentSave(null);
      setSaveChecked(true);
      return undefined;
    }

    let cancelled = false;
    setSaveChecked(false);

    loadTournamentProgress(user.uid, tournamentDate)
      .then((save) => {
        if (cancelled) {
          return;
        }

        setTournamentSave(save);
        setSaveChecked(true);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.warn("Failed to load Zen Mahjong tournament save:", error);
        setTournamentSave(null);
        setSaveChecked(true);
        toast({
          title: "Не удалось загрузить турнирное сохранение",
          description: "Откроется расклад дня. Проверьте соединение с Firebase.",
          variant: "destructive",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, toast, tournamentDate, user]);

  useEffect(() => {
    startMusic();

    return () => {
      stopMusic();
    };
  }, [startMusic, stopMusic]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextSeconds = getSecondsUntilNextDailyReset();
      setSecondsUntilReset(nextSeconds);

      if (nextSeconds === 0) {
        setTournamentDate(getTodayKey());
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <ProtectedRoute>
      <AppShell activePath="/leaderboard">
        <MotionShell>
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-background-mid to-[#13091d] p-5 shadow-glass md:p-7">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
              <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-purple-energy/35 bg-purple-energy/12 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-purple-energy shadow-premium">
                    <Trophy className="size-4" />
                    Daily Tournament
                  </div>
                  <h1 className="font-display text-4xl font-black uppercase tracking-[0.05em] text-zen-gradient md:text-6xl">
                    Ежедневный турнир
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Один детерминированный расклад для всех игроков. Собери доску быстрее, сохрани комбо и подготовься
                    к таблице лидеров следующего этапа.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-popover/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {formatTournamentDate(tournamentDate)}
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-purple-energy">
                    Следующая раскладка через
                  </p>
                  <p className="mt-1 font-display text-3xl font-black tracking-[0.08em] text-foreground">
                    {formatCountdown(secondsUntilReset)}
                  </p>
                  <Progress value={resetProgress} className="mt-4" />
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <TournamentInfoCard icon={<Shield />} label="Сложность" value="Hard Mode" />
              <TournamentInfoCard icon={<Users />} label="Правило дня" value="1 раскладка для всех игроков" />
              <TournamentInfoCard icon={<Flame />} label="Режим" value="Таймер, очки, комбо" />
            </section>

            <section className="rounded-2xl border border-primary/20 bg-[#120a16]/78 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl md:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
                  <Lock className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Competitive Rules</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hard Mode · No Hints · No Undo
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <TournamentRule icon={<Shield />} label="Hard Mode" />
                <TournamentRule icon={<Sparkles />} label="No Hints" />
                <TournamentRule icon={<Undo2 />} label="No Undo" />
              </div>
            </section>

            <section className="rounded-2xl border border-purple-energy/20 bg-[#0b0810]/70 p-2 shadow-premium backdrop-blur-xl md:p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-2 md:px-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  <Sparkles className="size-4" />
                  Турнирная доска · {tournamentDate}
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  Одинаковая для всех
                </div>
              </div>
              {saveChecked ? (
                <MahjongBoard
                  initialTiles={tournamentTiles}
                  initialSnapshot={initialSnapshot}
                  initialStateKey={`${tournamentDate}:${initialSnapshot ? "restored" : "fresh"}`}
                  lockedDifficulty="hard"
                  hintsEnabled={false}
                  undoEnabled={false}
                  onGameLost={handleTournamentLoss}
                  onGameWon={handleTournamentWin}
                  onProgressSnapshot={persistTournamentSnapshot}
                  restartEnabled={false}
                  showDifficultySelector={false}
                />
              ) : (
                <div className="grid min-h-[560px] place-items-center rounded-2xl border border-primary/10 bg-black/30 p-6 text-center">
                  <div>
                    <p className="font-display text-2xl font-black uppercase tracking-[0.08em] text-primary">
                      Загружаем турнир
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">Проверяем прогресс сегодняшней попытки...</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}

function createSnapshotFromTournamentSave(save: TournamentSaveState): MahjongBoardProgressSnapshot {
  return {
    layoutId: "daily-tournament",
    difficulty: "hard",
    tiles: save.tiles,
    removedTileIds: save.removedTileIds,
    selectedTileId: save.selectedTileId ?? null,
    score: save.score,
    comboMultiplier: save.comboMultiplier,
    elapsedSeconds: save.elapsedSeconds,
    movesCount: Math.floor(save.removedTileIds.length / 2),
    hintsUsed: 0,
    shufflesUsed: save.shufflesUsed,
    completed: save.completed,
    lost: save.lost,
  };
}

function TournamentInfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-card/82 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.26)] backdrop-blur-md">
      <div className="mb-3 text-primary [&_svg]:size-5">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground md:text-base">{value}</p>
    </div>
  );
}

function TournamentRule({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-purple-energy/20 bg-purple-energy/10 px-3 py-2 font-bold text-foreground">
      <span className="text-purple-energy [&_svg]:size-4">{icon}</span>
      {label}
    </div>
  );
}
