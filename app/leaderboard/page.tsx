"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Clock3, Globe2, MapPin, Medal, Play, Sparkles, Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { getTodayKey } from "@/src/lib/game";
import { demoLeaderboardEntries, type LeaderboardEntry } from "@/src/lib/leaderboard/demo-leaderboard";
import {
  getTournamentScoreLocal,
  mergeLeaderboardEntries,
  TOURNAMENT_SCORE_STORAGE_KEY,
  type RankedLeaderboardEntry,
  type SavedTournamentScore,
} from "@/src/lib/leaderboard/leaderboard-service";
import {
  DailyLeaderboardIndexError,
  getDailyLeaderboard,
  getUserDailyRank,
  type DailyLeaderboardEntry,
} from "@/src/lib/tournament/leaderboard";

type LeaderboardView = "global" | "daily" | "tournament" | "city";

const leaderboardViews: Array<{ id: LeaderboardView; label: string; icon: React.ReactNode }> = [
  { id: "global", label: "Общий", icon: <Globe2 className="size-3.5" /> },
  { id: "daily", label: "Сегодня", icon: <CalendarDays className="size-3.5" /> },
  { id: "tournament", label: "Турнир", icon: <Trophy className="size-3.5" /> },
  { id: "city", label: "Город", icon: <MapPin className="size-3.5" /> },
];

function formatTournamentDate(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatCompletedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMode(mode: LeaderboardEntry["mode"]) {
  if (mode === "daily") {
    return "Сегодня";
  }

  if (mode === "tournament") {
    return "Турнир";
  }

  return "Общий";
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [remoteEntries, setRemoteEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [remoteUserEntry, setRemoteUserEntry] = useState<DailyLeaderboardEntry | null>(null);
  const [savedScore, setSavedScore] = useState<SavedTournamentScore | null>(null);
  const [activeView, setActiveView] = useState<LeaderboardView>("global");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dateKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    setSavedScore(getTournamentScoreLocal());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOURNAMENT_SCORE_STORAGE_KEY) {
        setSavedScore(getTournamentScoreLocal());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const [dailyEntries, currentUserEntry] = await Promise.all([
          getDailyLeaderboard(dateKey, 50),
          user ? getUserDailyRank(dateKey, user.uid) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setRemoteEntries(dailyEntries);
        setRemoteUserEntry(currentUserEntry);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof DailyLeaderboardIndexError
            ? "Firestore требует индекс. Пока показываем демо-рейтинг."
            : "Live-рейтинг недоступен. Пока показываем демо-рейтинг.",
        );
        setRemoteEntries([]);
        setRemoteUserEntry(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [dateKey, user]);

  const currentSavedScore = useMemo(() => {
    if (!savedScore) {
      return null;
    }

    if (savedScore.userId && user?.uid && savedScore.userId !== user.uid) {
      return null;
    }

    return savedScore;
  }, [savedScore, user?.uid]);

  const remoteLeaderboardEntries = useMemo(
    () => remoteEntries.map((entry) => dailyEntryToLeaderboardEntry(entry, entry.uid === user?.uid)),
    [remoteEntries, user?.uid],
  );

  const remoteCurrentEntry = useMemo(
    () => (remoteUserEntry ? dailyEntryToLeaderboardEntry(remoteUserEntry, true) : null),
    [remoteUserEntry],
  );

  const currentCity = currentSavedScore?.city ?? remoteCurrentEntry?.city ?? "Алматы";

  const sourceEntries = useMemo(() => {
    const baseEntries: LeaderboardEntry[] = [...demoLeaderboardEntries];

    if (activeView === "global" || activeView === "daily") {
      baseEntries.push(...remoteLeaderboardEntries);
    }

    if (remoteCurrentEntry && (activeView === "global" || activeView === "daily")) {
      baseEntries.push(remoteCurrentEntry);
    }

    if (activeView === "daily") {
      return baseEntries.filter((entry) => entry.mode === "daily" || entry.isCurrentUser);
    }

    if (activeView === "tournament") {
      return baseEntries.filter((entry) => entry.mode === "tournament" || entry.isCurrentUser);
    }

    if (activeView === "city") {
      return baseEntries.filter((entry) => entry.city === currentCity || entry.isCurrentUser);
    }

    return baseEntries;
  }, [activeView, currentCity, remoteCurrentEntry, remoteLeaderboardEntries]);

  const entries = useMemo(
    () => mergeLeaderboardEntries(sourceEntries, currentSavedScore),
    [currentSavedScore, sourceEntries],
  );
  const currentEntry = entries.find((entry) => entry.isCurrentUser) ?? null;
  const podium = entries.slice(0, 3);
  const leader = podium[0] ?? null;
  const showLoadingState = loading && entries.length === 0;

  return (
    <ProtectedRoute>
      <AppShell activePath="/leaderboard">
        <MotionShell>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-6">
            <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-background-mid to-[#100719] p-3 shadow-glass md:rounded-2xl md:p-7">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
              <div className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div>
                  <Badge variant="premium" className="mb-3 gap-2 rounded-lg uppercase tracking-[0.14em] md:mb-4 md:tracking-[0.18em]">
                    <Sparkles className="size-3.5" />
                    Демо + live рейтинг
                  </Badge>
                  <h1 className="font-display text-3xl font-black uppercase tracking-[0.05em] text-zen-gradient md:text-6xl">
                    Рейтинг турнира
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:mt-3 md:text-base">
                    Таблица объединяет демо-игроков Казахстана, live-результаты Firestore и ваш сохранённый турнирный
                    счёт. Ранг считается по очкам, затем по времени.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-popover/75 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {formatTournamentDate(dateKey)}
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-purple-energy">Лидер</p>
                  <p className="mt-1 font-display text-xl font-black uppercase tracking-[0.06em] text-foreground md:text-2xl">
                    {leader ? leader.name : "Пока нет результатов"}
                  </p>
                  <p className="mt-1 text-sm text-primary">
                    {leader ? `${leader.score.toLocaleString("ru-RU")} очков · ${formatTime(leader.timeSeconds)}` : "Заверши турнир первым"}
                  </p>
                </div>
              </div>
            </section>

            {errorMessage ? <LeaderboardError message={errorMessage} /> : null}

            <LeaderboardViewTabs activeView={activeView} onChange={setActiveView} />

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-xl border border-primary/15 bg-card/78 p-3 shadow-premium backdrop-blur-xl md:rounded-2xl md:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Top 3</p>
                    <h2 className="mt-1 font-display text-xl font-black uppercase tracking-[0.05em] text-foreground md:text-2xl">
                      Подиум
                    </h2>
                  </div>
                  <Trophy className="size-7 text-primary" />
                </div>
                {showLoadingState ? (
                  <PodiumSkeleton />
                ) : podium.length > 0 ? (
                  <div className="grid items-end gap-3 md:grid-cols-3">
                    <PodiumCard entry={podium[1]} placeLabel="2" compact />
                    <PodiumCard entry={podium[0]} placeLabel="1" featured />
                    <PodiumCard entry={podium[2]} placeLabel="3" compact />
                  </div>
                ) : (
                  <EmptyLeaderboard />
                )}
              </div>

              <CurrentUserCard entry={currentEntry} loading={loading && !currentEntry} />
            </section>

            <section className="overflow-hidden rounded-xl border border-primary/15 bg-card/82 p-2 shadow-premium backdrop-blur-xl md:rounded-2xl md:p-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3 md:px-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Полная таблица</p>
                  <h2 className="mt-1 font-display text-xl font-black uppercase tracking-[0.05em] text-foreground">
                    {getTableTitle(activeView, currentCity)}
                  </h2>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/tournament">
                    <Play className="size-4" />
                    Играть турнир
                  </Link>
                </Button>
              </div>

              <LeaderboardTable entries={entries} loading={showLoadingState} />
            </section>
          </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}

function dailyEntryToLeaderboardEntry(entry: DailyLeaderboardEntry, current: boolean): LeaderboardEntry {
  return {
    id: entry.uid,
    name: entry.name,
    city: entry.city ?? "Алматы",
    country: "Казахстан",
    score: entry.score,
    timeSeconds: entry.elapsedSeconds,
    completedAt: entry.completedAt?.toISOString() ?? new Date().toISOString(),
    mode: "daily",
    ...(current ? { isCurrentUser: true } : {}),
  };
}

function getTableTitle(activeView: LeaderboardView, city: string) {
  if (activeView === "daily") {
    return "Сегодняшние результаты";
  }

  if (activeView === "tournament") {
    return "Турнирный зачёт";
  }

  if (activeView === "city") {
    return `Городской рейтинг · ${city}`;
  }

  return "Все игроки";
}

function LeaderboardViewTabs({
  activeView,
  onChange,
}: {
  activeView: LeaderboardView;
  onChange: (view: LeaderboardView) => void;
}) {
  return (
    <Tabs value={activeView} onValueChange={(value) => onChange(value as LeaderboardView)}>
      <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-xl border border-primary/15 bg-card/72 p-2 shadow-premium backdrop-blur-xl">
        {leaderboardViews.map((view) => (
          <TabsTrigger key={view.id} value={view.id} className="gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.12em]">
            {view.icon}
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function LeaderboardError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 size-5 text-primary" />
      <div>
        <p className="font-bold">Live-синхронизация временно недоступна</p>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function PodiumCard({
  compact,
  entry,
  featured,
  placeLabel,
}: {
  compact?: boolean;
  entry?: RankedLeaderboardEntry;
  featured?: boolean;
  placeLabel: string;
}) {
  if (!entry) {
    return (
      <div className={cn("rounded-xl border border-primary/10 bg-popover/45 p-4 text-center", featured ? "md:min-h-72" : "md:min-h-56")}>
        <p className="text-sm text-muted-foreground">Место #{placeLabel} свободно</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-popover/72 p-4 text-center shadow-[0_18px_52px_rgba(0,0,0,0.28)]",
        featured
          ? "border-primary/35 bg-gradient-to-b from-primary/18 to-popover/80 md:min-h-72 md:p-6"
          : "border-purple-energy/20 md:min-h-56",
        entry.isCurrentUser ? "shadow-ember ring-1 ring-primary/40" : null,
        compact ? "md:mb-4" : null,
      )}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div
        className={cn(
          "mx-auto mb-3 grid place-items-center rounded-full border font-display font-black",
          featured
            ? "size-14 border-primary/35 bg-primary/18 text-2xl text-primary"
            : "size-11 border-purple-energy/30 bg-purple-energy/12 text-lg text-purple-energy",
        )}
      >
        {placeLabel}
      </div>
      <PlayerAvatar entry={entry} className={featured ? "mx-auto size-16" : "mx-auto size-12"} />
      <h3 className="mt-3 line-clamp-1 font-bold text-foreground">{entry.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{entry.city}</p>
      <p className={cn("mt-4 font-display font-black text-primary", featured ? "text-3xl" : "text-xl")}>
        {entry.score.toLocaleString("ru-RU")}
      </p>
      <div className="mt-3 flex justify-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="size-3.5" />
          {formatTime(entry.timeSeconds)}
        </span>
        <span>{formatMode(entry.mode)}</span>
      </div>
    </div>
  );
}

function CurrentUserCard({ entry, loading }: { entry: RankedLeaderboardEntry | null; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-purple-energy/20 bg-[#110a18]/82 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-energy">Ваш результат</p>
      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="h-7 rounded bg-muted/70" />
          <div className="h-4 w-2/3 rounded bg-muted/50" />
          <div className="h-11 rounded-lg bg-muted/50" />
        </div>
      ) : entry ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-black text-primary">#{entry.rank}</p>
              <p className="text-sm text-muted-foreground">место в таблице</p>
            </div>
            <Medal className="size-10 text-primary" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Очки" value={entry.score.toLocaleString("ru-RU")} />
            <Metric label="Время" value={formatTime(entry.timeSeconds)} />
            <Metric label="Город" value={entry.city} />
            <Metric label="Режим" value={formatMode(entry.mode)} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Сохранено: {formatCompletedAt(entry.completedAt)}</p>
          <Button asChild className="mt-5 w-full">
            <Link href="/tournament">Открыть турнир</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Сыграйте турнир и выйдите из режима. Ваш счёт сохранится локально и появится здесь.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href="/tournament">
              <Play className="size-4" />
              Играть турнир
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function LeaderboardTable({
  entries,
  loading,
}: {
  entries: RankedLeaderboardEntry[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-16 rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyLeaderboard />;
  }

  return (
    <>
      <div className="grid gap-2 p-1 md:hidden">
        {entries.map((entry) => (
          <LeaderboardMobileCard key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[780px]">
          <div className="grid grid-cols-[80px_minmax(220px,1fr)_150px_130px_110px_170px] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <span>Место</span>
            <span>Игрок</span>
            <span>Город</span>
            <span>Очки</span>
            <span>Время</span>
            <span>Режим / дата</span>
          </div>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "grid grid-cols-[80px_minmax(220px,1fr)_150px_130px_110px_170px] items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm transition",
                entry.isCurrentUser
                  ? "border-primary/45 bg-primary/15 shadow-ember"
                  : entry.rank <= 3
                    ? "border-purple-energy/25 bg-purple-energy/10"
                    : "hover:border-primary/20 hover:bg-popover/60",
              )}
            >
              <span className={cn("font-display text-lg font-black", entry.rank <= 3 ? "text-primary" : "text-muted-foreground")}>
                #{entry.rank}
              </span>
              <div className="flex items-center gap-3">
                <PlayerAvatar entry={entry} />
                <div>
                  <p className="font-bold text-foreground">
                    {entry.name}
                    {entry.isCurrentUser ? <span className="ml-2 text-xs text-primary">вы</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.country}</p>
                </div>
              </div>
              <span className="text-muted-foreground">{entry.city}</span>
              <span className="font-bold">{entry.score.toLocaleString("ru-RU")}</span>
              <span>{formatTime(entry.timeSeconds)}</span>
              <span className="text-xs text-muted-foreground">
                {formatMode(entry.mode)} · {formatCompletedAt(entry.completedAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function LeaderboardMobileCard({ entry }: { entry: RankedLeaderboardEntry }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        entry.isCurrentUser
          ? "border-primary/45 bg-primary/15 shadow-ember"
          : entry.rank <= 3
            ? "border-purple-energy/25 bg-purple-energy/10"
            : "border-primary/10 bg-popover/62",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-display text-2xl font-black text-primary">#{entry.rank}</span>
          <PlayerAvatar entry={entry} className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">
              {entry.name}
              {entry.isCurrentUser ? <span className="ml-2 text-xs text-primary">вы</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">{entry.city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-black text-primary">{entry.score.toLocaleString("ru-RU")}</p>
          <p className="text-xs text-muted-foreground">очков</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Время" value={formatTime(entry.timeSeconds)} />
        <Metric label="Режим" value={formatMode(entry.mode)} />
        <Metric label="Дата" value={formatCompletedAt(entry.completedAt)} />
      </div>
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-primary/10 bg-black/20 p-6 text-center">
      <div>
        <Trophy className="mx-auto size-8 text-primary" />
        <p className="mt-3 font-bold text-foreground">Результатов пока нет</p>
        <p className="mt-1 text-sm text-muted-foreground">Завершите турнир, чтобы попасть в рейтинг.</p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/tournament">Играть турнир</Link>
        </Button>
      </div>
    </div>
  );
}

function PodiumSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-56 rounded-xl bg-muted/50" />
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-popover/65 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-bold text-foreground">{value}</p>
    </div>
  );
}

function PlayerAvatar({ className, entry }: { className?: string; entry: LeaderboardEntry }) {
  const fallback = entry.name.slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn("border border-primary/25", className)}>
      <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(entry.name)}`} alt={entry.name} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
