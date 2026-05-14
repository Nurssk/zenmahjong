"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Brain,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Flame,
  Gauge,
  Medal,
  MousePointerClick,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PerformanceChart } from "@/components/stats/performance-chart";
import { RecentGameRow } from "@/components/stats/recent-game-row";
import { BreakdownBars, StatsChartCard } from "@/components/stats/stats-chart-card";
import { StatsCard } from "@/components/stats/stats-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { getStatsDashboardDataForUser } from "@/src/lib/stats/stats-service";
import { GAME_HISTORY_STORAGE_KEY, STATS_UPDATED_EVENT } from "@/src/lib/stats/game-history-service";
import type { PlayerStatsSummary, StatsDashboardData } from "@/src/lib/stats/stats-types";
import { TOURNAMENT_SCORE_STORAGE_KEY } from "@/src/lib/leaderboard/leaderboard-service";

export default function StatsPage() {
  const [data, setData] = useState<StatsDashboardData | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const userId = user?.uid ?? null;

    const refreshStats = () => {
      void getStatsDashboardDataForUser(userId).then((nextData) => {
        if (!cancelled) {
          setData(nextData);
        }
      });
    };

    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    refreshStats();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === GAME_HISTORY_STORAGE_KEY || event.key === TOURNAMENT_SCORE_STORAGE_KEY) {
        refreshStats();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STATS_UPDATED_EVENT, refreshStats);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STATS_UPDATED_EVENT, refreshStats);
    };
  }, [authLoading, user?.uid]);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Игр сыграно",
        value: data.summary.gamesPlayed.toLocaleString("ru-RU"),
        detail: `${data.summary.gamesWon.toLocaleString("ru-RU")} побед · ${data.summary.gamesLost.toLocaleString("ru-RU")} поражений`,
        icon: Activity,
        accent: "orange" as const,
      },
      {
        label: "Процент побед",
        value: `${data.summary.winRate}%`,
        detail: `По завершённым играм: ${data.summary.completedGames.toLocaleString("ru-RU")}`,
        icon: Trophy,
        accent: "purple" as const,
      },
      {
        label: "Не завершены",
        value: data.summary.gamesUnfinished.toLocaleString("ru-RU"),
        detail: "Прерванные сессии и ранние выходы",
        icon: Gauge,
        accent: "purple" as const,
      },
      {
        label: "Лучший счёт",
        value: data.summary.bestScore.toLocaleString("ru-RU"),
        detail: "Максимальный результат за одну игру",
        icon: Medal,
        accent: "orange" as const,
      },
      {
        label: "Лучшее время",
        value: formatNullableDuration(data.summary.bestTimeSeconds),
        detail: "Самое быстрое завершение",
        icon: Timer,
        accent: "purple" as const,
      },
      {
        label: "Время в игре",
        value: formatPlayTime(data.summary.totalPlayTimeSeconds),
        detail: "Суммарное время фокус-сессий",
        icon: Clock3,
        accent: "orange" as const,
      },
      {
        label: "Focus Score",
        value: `${data.summary.focusScore}`,
        detail: "Фокус, стабильность и чистота прохождения",
        icon: Brain,
        accent: "purple" as const,
      },
    ];
  }, [data]);

  return (
    <ProtectedRoute>
      <AppShell activePath="/stats">
        <MotionShell>
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:gap-8">
          <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-background-mid to-[#120719] p-4 shadow-glass md:rounded-2xl md:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <PageHeader
                eyebrow="Analytics"
                title="Статистика"
                description="Ваш прогресс, фокус и игровые результаты: регулярные партии, daily-сессии и турниры."
              />
              <DataSourceCard data={data} />
            </div>
          </section>

          {!data ? (
            <StatsLoadingState />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map((card) => (
                  <StatsCard key={card.label} {...card} />
                ))}
              </section>

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <PerformancePanel data={data} />
                <FocusPanel data={data} />
              </section>

              <PerformanceChart scoreTrend={data.scoreTrend} weeklyActivity={data.weeklyActivity} />

              <section className="grid gap-4 xl:grid-cols-3">
                <StatsChartCard eyebrow="Режимы" title="Типы игр">
                  <BreakdownBars items={data.modeBreakdown} />
                </StatsChartCard>
                <StatsChartCard eyebrow="Сложность" title="Профиль нагрузки">
                  <BreakdownBars items={data.difficultyBreakdown} tone="purple" />
                </StatsChartCard>
                <StatsChartCard eyebrow="Исходы" title="Статусы игр">
                  <BreakdownBars items={data.winLossBreakdown} />
                </StatsChartCard>
              </section>

              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <StatsChartCard eyebrow="История" title="Последние игры">
                  <div className="space-y-3">
                    {data.recentGames.map((game) => (
                      <RecentGameRow key={game.id} game={game} />
                    ))}
                  </div>
                </StatsChartCard>

                <StatsChartCard eyebrow="Сравнение" title="Regular vs Tournament">
                  <div className="space-y-3">
                    <ModeSummary label="Обычные + Daily" summary={data.regularSummary} />
                    <ModeSummary label="Турнир" summary={data.tournamentSummary} accent="purple" />
                  </div>
                </StatsChartCard>
              </section>
            </>
          )}
          </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}

function DataSourceCard({ data }: { data: StatsDashboardData | null }) {
  const isDemo = !data || data.source === "demo";
  const isFirestore = data?.source === "firestore";

  return (
    <div className="rounded-xl border border-primary/20 bg-popover/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Badge
          variant={isDemo ? "premium" : "outline"}
          className="gap-2 rounded-lg uppercase tracking-[0.14em]"
        >
          <Sparkles className="size-3.5" />
          {isDemo ? "Демо-данные" : isFirestore ? "Firestore" : "Локальные данные"}
        </Badge>
        <span className="text-xs font-bold text-muted-foreground">{data ? `${data.results.length} записей` : "Загрузка"}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {isDemo
          ? "Если сохранённых партий ещё нет, страница показывает презентационный набор данных."
          : isFirestore
            ? "Страница построена на синхронизированной истории игр из Firestore."
            : "Страница построена на локальной истории игр и сохранённом турнирном результате."}
      </p>
    </div>
  );
}

function StatsLoadingState() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-xl border border-primary/10 bg-card/70 shadow-glass"
        />
      ))}
    </div>
  );
}

function PerformancePanel({ data }: { data: StatsDashboardData }) {
  const metrics = [
    ["Средний счёт", data.summary.averageScore.toLocaleString("ru-RU"), ChartNoAxesColumnIncreasing],
    ["Среднее время", formatNullableDuration(data.summary.averageTimeSeconds), Clock3],
    ["Средние ходы", data.summary.averageMoves.toLocaleString("ru-RU"), MousePointerClick],
    ["Лучшее комбо", `x${data.summary.bestCombo}`, Flame],
    ["Подсказки", data.totalHintsUsed.toLocaleString("ru-RU"), Target],
    ["Undo", data.totalUndoUsed.toLocaleString("ru-RU"), Gauge],
  ] as const;

  return (
    <StatsChartCard eyebrow="Performance" title="Качество игры">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border border-primary/12 bg-popover/55 p-4">
            <Icon className="mb-3 size-4 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-xl font-black tracking-[0.03em] text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </StatsChartCard>
  );
}

function FocusPanel({ data }: { data: StatsDashboardData }) {
  const averageSession = data.summary.averageTimeSeconds ?? 0;

  return (
    <StatsChartCard eyebrow="Focus Mode" title="Фокус и стабильность">
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-foreground">Focus Score</span>
            <span className="font-display text-2xl font-black text-primary">{data.summary.focusScore}</span>
          </div>
          <Progress value={data.summary.focusScore} />
        </div>
        <div className="grid gap-3">
          <FocusMetric label="Серия концентрации" value={`${data.summary.currentStreak} побед`} />
          <FocusMetric label="Средняя сессия" value={formatNullableDuration(averageSession)} />
          <FocusMetric label="Быстрое завершение" value={formatNullableDuration(data.summary.bestTimeSeconds)} />
        </div>
      </div>
    </StatsChartCard>
  );
}

function FocusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/12 bg-popover/55 px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-foreground">{value}</span>
    </div>
  );
}

function ModeSummary({
  label,
  summary,
  accent = "orange",
}: {
  label: string;
  summary: PlayerStatsSummary;
  accent?: "orange" | "purple";
}) {
  return (
    <div className="rounded-xl border border-primary/12 bg-popover/55 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold text-foreground">{label}</h3>
        <span className={cn("text-sm font-black", accent === "purple" ? "text-purple-energy" : "text-primary")}>
          {summary.winRate}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <ModeMetric label="Игр" value={summary.gamesPlayed.toLocaleString("ru-RU")} />
        <ModeMetric label="Побед" value={summary.gamesWon.toLocaleString("ru-RU")} />
        <ModeMetric label="Лучший счёт" value={summary.bestScore.toLocaleString("ru-RU")} />
        <ModeMetric label="Лучшее время" value={formatNullableDuration(summary.bestTimeSeconds)} />
      </div>
    </div>
  );
}

function ModeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

function formatNullableDuration(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return "—";
  }

  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatPlayTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }

  return `${minutes}м`;
}
