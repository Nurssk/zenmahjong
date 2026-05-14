import {
  getTournamentScoreLocal as getLeaderboardTournamentScoreLocal,
  type SavedTournamentScore,
} from "@/src/lib/leaderboard/leaderboard-service";
import { getGameHistoryFirestore, getGameHistoryLocal } from "@/src/lib/stats/game-history-service";
import { createDemoGameResults } from "@/src/lib/stats/demo-stats";
import type {
  BreakdownPoint,
  GameResult,
  PlayerStatsSummary,
  ScoreTrendPoint,
  StatsDashboardData,
  WeeklyActivityPoint,
} from "@/src/lib/stats/stats-types";

const EMPTY_SUMMARY: PlayerStatsSummary = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesUnfinished: 0,
  completedGames: 0,
  winRate: 0,
  bestScore: 0,
  averageScore: 0,
  bestTimeSeconds: null,
  averageTimeSeconds: null,
  totalPlayTimeSeconds: 0,
  averageMoves: 0,
  bestCombo: 0,
  currentStreak: 0,
  focusScore: 0,
};

export function getTournamentScoreLocal(): SavedTournamentScore | null {
  return getLeaderboardTournamentScoreLocal();
}

export function getStatsDashboardData(): StatsDashboardData {
  const localHistory = getGameHistoryLocal();
  const tournamentScore = getTournamentScoreLocal();
  const realResults = mergeTournamentScore(localHistory, tournamentScore);
  const source = realResults.length > 0 ? "local" : "demo";
  const results = source === "local" ? realResults : createDemoGameResults();

  return buildStatsDashboardData(results, source);
}

export async function getStatsDashboardDataForUser(uid: string | null | undefined): Promise<StatsDashboardData> {
  if (!uid) {
    return getStatsDashboardData();
  }

  try {
    const firestoreHistory = await getGameHistoryFirestore(uid);

    if (firestoreHistory.length > 0) {
      return buildStatsDashboardData(firestoreHistory, "firestore");
    }

    return buildStatsDashboardData(createDemoGameResults(), "demo");
  } catch (error) {
    void error;
  }

  return getStatsDashboardData();
}

export function buildStatsDashboardData(
  results: readonly GameResult[],
  source: StatsDashboardData["source"] = "local",
): StatsDashboardData {
  const normalizedResults = [...results].sort(sortByEndedAtDesc);
  const regularResults = normalizedResults.filter((result) => result.mode === "regular" || result.mode === "daily");
  const tournamentResults = normalizedResults.filter((result) => result.mode === "tournament");

  return {
    source,
    results: normalizedResults,
    summary: buildStatsSummary(normalizedResults),
    recentGames: normalizedResults.slice(0, 8),
    weeklyActivity: buildWeeklyActivity(normalizedResults),
    scoreTrend: buildScoreTrend(normalizedResults),
    difficultyBreakdown: buildBreakdown(normalizedResults, (result) => result.difficulty, {
      easy: "Лёгкий",
      medium: "Средний",
      hard: "Сложный",
    }),
    modeBreakdown: buildBreakdown(normalizedResults, (result) => result.mode, {
      regular: "Обычная",
      daily: "Ежедневная",
      tournament: "Турнир",
    }),
    winLossBreakdown: buildStatusBreakdown(normalizedResults),
    totalHintsUsed: sum(normalizedResults, (result) => result.hintsUsed ?? 0),
    totalUndoUsed: sum(normalizedResults, (result) => result.undoUsed ?? 0),
    regularSummary: buildStatsSummary(regularResults),
    tournamentSummary: buildStatsSummary(tournamentResults),
  };
}

export function buildStatsSummary(results: readonly GameResult[]): PlayerStatsSummary {
  if (results.length === 0) {
    return EMPTY_SUMMARY;
  }

  const wonResults = results.filter((result) => result.status === "won");
  const lostResults = results.filter((result) => result.status === "lost");
  const unfinishedResults = results.filter((result) => result.status === "unfinished");
  const completedResults = results.filter((result) => result.status === "won" || result.status === "lost");
  const bestTimeSeconds = wonResults.length > 0 ? Math.min(...wonResults.map((result) => result.timeSeconds)) : null;
  const averageTimeSeconds = results.length > 0 ? Math.round(sum(results, (result) => result.timeSeconds) / results.length) : null;
  const averageScore = Math.round(sum(results, (result) => result.score) / results.length);
  const averageMoves = Math.round(sum(results, (result) => result.moves) / results.length);
  const winRate =
    completedResults.length > 0 ? Math.round((wonResults.length / completedResults.length) * 100) : 0;
  const bestCombo = Math.max(0, ...results.map((result) => result.maxCombo ?? 0));
  const focusScore = calculateFocusScore(results, winRate, bestCombo);

  return {
    gamesPlayed: results.length,
    gamesWon: wonResults.length,
    gamesLost: lostResults.length,
    gamesUnfinished: unfinishedResults.length,
    completedGames: completedResults.length,
    winRate,
    bestScore: Math.max(0, ...results.map((result) => result.score)),
    averageScore,
    bestTimeSeconds,
    averageTimeSeconds,
    totalPlayTimeSeconds: sum(results, (result) => result.timeSeconds),
    averageMoves,
    bestCombo,
    currentStreak: calculateCurrentStreak(results),
    focusScore,
  };
}

function mergeTournamentScore(
  history: readonly GameResult[],
  tournamentScore: SavedTournamentScore | null,
): GameResult[] {
  if (!tournamentScore) {
    return [...history];
  }

  const tournamentResult = tournamentScoreToGameResult(tournamentScore);

  return [
    tournamentResult,
    ...history.filter((result) => result.id !== tournamentResult.id),
  ].sort(sortByEndedAtDesc);
}

function tournamentScoreToGameResult(score: SavedTournamentScore): GameResult {
  const endedAt = new Date(score.completedAt);
  const safeEndedAt = Number.isNaN(endedAt.getTime()) ? new Date() : endedAt;
  const startedAt = new Date(safeEndedAt.getTime() - Math.max(0, score.timeSeconds) * 1000).toISOString();
  const endedAtIso = safeEndedAt.toISOString();

  return {
    id: `tournament-${score.date}`,
    mode: "tournament",
    difficulty: "hard",
    status: score.score > 0 ? "won" : "unfinished",
    score: score.score,
    timeSeconds: score.timeSeconds,
    moves: 72,
    matchedPairs: 72,
    totalPairs: 72,
    completed: score.score > 0,
    won: score.score > 0,
    maxCombo: 6,
    hintsUsed: 0,
    undoUsed: 0,
    startedAt,
    endedAt: endedAtIso,
    date: score.date,
    reason: score.score > 0 ? "win" : "exit",
  };
}

function buildWeeklyActivity(results: readonly GameResult[]): WeeklyActivityPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const points: WeeklyActivityPoint[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - offset);
    const dayKey = dayDate.toISOString().slice(0, 10);
    const dayResults = results.filter((result) => result.date === dayKey);

    points.push({
      day: formatShortWeekday(dayDate),
      games: dayResults.length,
      wins: dayResults.filter((result) => result.status === "won").length,
      score: sum(dayResults, (result) => result.score),
    });
  }

  return points;
}

function buildScoreTrend(results: readonly GameResult[]): ScoreTrendPoint[] {
  return [...results]
    .sort(sortByEndedAtAsc)
    .slice(-8)
    .map((result, index) => ({
      label: `${index + 1}`,
      score: result.score,
      result: result.status,
    }));
}

function buildBreakdown<T extends string>(
  results: readonly GameResult[],
  getKey: (result: GameResult) => T,
  labels: Record<T, string>,
): BreakdownPoint[] {
  const total = Math.max(1, results.length);

  return Object.entries(labels).map(([key, label]) => {
    const value = results.filter((result) => getKey(result) === key).length;

    return {
      label: label as string,
      value,
      percentage: Math.round((value / total) * 100),
    };
  });
}

function buildStatusBreakdown(results: readonly GameResult[]): BreakdownPoint[] {
  const total = Math.max(1, results.length);
  const statuses = [
    ["Победы", results.filter((result) => result.status === "won").length],
    ["Поражения", results.filter((result) => result.status === "lost").length],
    ["Не завершены", results.filter((result) => result.status === "unfinished").length],
  ] as const;

  return statuses.map(([label, value]) => ({
    label,
    value,
    percentage: Math.round((value / total) * 100),
  }));
}

function calculateCurrentStreak(results: readonly GameResult[]) {
  let streak = 0;

  for (const result of [...results].sort(sortByEndedAtDesc)) {
    if (result.status === "unfinished") {
      continue;
    }

    if (result.status !== "won") {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateFocusScore(results: readonly GameResult[], winRate: number, bestCombo: number) {
  const averageCompletion = sum(results, (result) => result.matchedPairs / Math.max(1, result.totalPairs)) / results.length;
  const averageHints = sum(results, (result) => result.hintsUsed ?? 0) / results.length;
  const averageUndo = sum(results, (result) => result.undoUsed ?? 0) / results.length;
  const unfinishedPenalty = results.filter((result) => result.status === "unfinished").length * 3;
  const disciplinePenalty = Math.min(24, averageHints * 6 + averageUndo * 4 + unfinishedPenalty);
  const comboBonus = Math.min(12, bestCombo);

  return clamp(Math.round(winRate * 0.55 + averageCompletion * 30 + comboBonus - disciplinePenalty), 0, 100);
}

function formatShortWeekday(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", "");
}

function sortByEndedAtDesc(first: GameResult, second: GameResult) {
  return second.endedAt.localeCompare(first.endedAt);
}

function sortByEndedAtAsc(first: GameResult, second: GameResult) {
  return first.endedAt.localeCompare(second.endedAt);
}

function sum<T>(items: readonly T[], getValue: (item: T) => number) {
  return items.reduce((total, item) => total + getValue(item), 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
