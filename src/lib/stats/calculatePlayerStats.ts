export type GameMode = "classic" | "daily" | "tournament" | "focus";

export type ModeStats = {
  totalGames: number;
  wins: number;
  winRate: number;
  bestScore: number;
  bestTime: number | null;
};

export type PlayerStats = {
  totalGames: number;
  wins: number;
  winRate: number;
  bestTime: number | null;
  averageTime: number | null;
  bestScore: number;
  averageScore: number;
  currentWinStreak: number;
  bestWinStreak: number;
  totalHintsUsed: number;
  totalShufflesUsed: number;
  totalUndoUsed: number;
  byMode: Record<GameMode, ModeStats>;
};

export type NormalizedGameHistoryRecord = {
  id: string;
  mode: GameMode;
  difficulty: "easy" | "medium" | "hard";
  status: "won" | "lost" | "unfinished";
  score: number | null;
  timeSeconds: number | null;
  hintsUsed: number;
  shufflesUsed: number;
  undoUsed: number;
  completedAt: Date | null;
};

const GAME_MODES: GameMode[] = ["classic", "daily", "tournament", "focus"];

const EMPTY_MODE_STATS: ModeStats = {
  totalGames: 0,
  wins: 0,
  winRate: 0,
  bestScore: 0,
  bestTime: null,
};

export function calculatePlayerStats(records: readonly unknown[]): PlayerStats {
  const games = records.flatMap((record, index) => normalizeGameHistoryRecord(record, index));
  const wins = games.filter((game) => game.status === "won");
  const completedGames = games.filter((game) => game.status === "won" || game.status === "lost");
  const validScores = games.flatMap((game) => (typeof game.score === "number" ? [game.score] : []));
  const validTimes = games.flatMap((game) => (typeof game.timeSeconds === "number" ? [game.timeSeconds] : []));
  const wonTimes = wins.flatMap((game) => (typeof game.timeSeconds === "number" ? [game.timeSeconds] : []));

  return {
    totalGames: games.length,
    wins: wins.length,
    winRate: calculateWinRate(wins.length, completedGames.length),
    bestTime: wonTimes.length > 0 ? Math.min(...wonTimes) : null,
    averageTime: validTimes.length > 0 ? Math.round(sum(validTimes) / validTimes.length) : null,
    bestScore: validScores.length > 0 ? Math.max(...validScores) : 0,
    averageScore: validScores.length > 0 ? Math.round(sum(validScores) / validScores.length) : 0,
    currentWinStreak: calculateCurrentWinStreak(games),
    bestWinStreak: calculateBestWinStreak(games),
    totalHintsUsed: sum(games.map((game) => game.hintsUsed)),
    totalShufflesUsed: sum(games.map((game) => game.shufflesUsed)),
    totalUndoUsed: sum(games.map((game) => game.undoUsed)),
    byMode: buildModeStats(games),
  };
}

export function normalizeGameHistoryRecord(
  record: unknown,
  fallbackIndex = 0,
): NormalizedGameHistoryRecord[] {
  if (!record || typeof record !== "object") {
    return [];
  }

  const data = record as Record<string, unknown>;
  const completedAt = getDateValue(data.completedAt) ?? getDateValue(data.endedAt) ?? getDateValue(data.playedAt) ?? getDateValue(data.date);

  return [
    {
      id: getString(data.id) || `game-${fallbackIndex}`,
      mode: normalizeMode(data.mode),
      difficulty: normalizeDifficulty(data.difficulty),
      status: normalizeStatus(data),
      score: getOptionalNumber(data.score),
      timeSeconds: getOptionalNumber(data.timeSeconds) ?? getOptionalNumber(data.elapsedSeconds) ?? null,
      hintsUsed: getSafeCount(data.hintsUsed),
      shufflesUsed: getSafeCount(data.shufflesUsed ?? data.shuffleUsed ?? data.shuffles),
      undoUsed: getSafeCount(data.undoUsed ?? data.undosUsed ?? data.undoMovesUsed),
      completedAt,
    },
  ];
}

export function getRecentPlayerGames(
  records: readonly unknown[],
  limit = 5,
): NormalizedGameHistoryRecord[] {
  return records
    .flatMap((record, index) => normalizeGameHistoryRecord(record, index))
    .sort(sortByCompletedAtDesc)
    .slice(0, limit);
}

function buildModeStats(games: readonly NormalizedGameHistoryRecord[]): Record<GameMode, ModeStats> {
  return GAME_MODES.reduce<Record<GameMode, ModeStats>>((accumulator, mode) => {
    const modeGames = games.filter((game) => game.mode === mode);
    const modeWins = modeGames.filter((game) => game.status === "won");
    const completedModeGames = modeGames.filter((game) => game.status === "won" || game.status === "lost");
    const scores = modeGames.flatMap((game) => (typeof game.score === "number" ? [game.score] : []));
    const wonTimes = modeWins.flatMap((game) => (typeof game.timeSeconds === "number" ? [game.timeSeconds] : []));

    accumulator[mode] = {
      totalGames: modeGames.length,
      wins: modeWins.length,
      winRate: calculateWinRate(modeWins.length, completedModeGames.length),
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      bestTime: wonTimes.length > 0 ? Math.min(...wonTimes) : null,
    };

    return accumulator;
  }, createEmptyModeStats());
}

function createEmptyModeStats(): Record<GameMode, ModeStats> {
  return {
    classic: { ...EMPTY_MODE_STATS },
    daily: { ...EMPTY_MODE_STATS },
    tournament: { ...EMPTY_MODE_STATS },
    focus: { ...EMPTY_MODE_STATS },
  };
}

function calculateCurrentWinStreak(games: readonly NormalizedGameHistoryRecord[]) {
  let streak = 0;

  for (const game of games.filter(isCompletedGame).sort(sortByCompletedAtDesc)) {
    if (game.status !== "won") {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateBestWinStreak(games: readonly NormalizedGameHistoryRecord[]) {
  let bestStreak = 0;
  let currentStreak = 0;

  for (const game of games.filter(isCompletedGame).sort(sortByCompletedAtAsc)) {
    if (game.status === "won") {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
}

function normalizeMode(value: unknown): GameMode {
  if (value === "daily") {
    return "daily";
  }

  if (value === "tournament") {
    return "tournament";
  }

  if (value === "focus") {
    return "focus";
  }

  return "classic";
}

function normalizeDifficulty(value: unknown): NormalizedGameHistoryRecord["difficulty"] {
  return value === "medium" || value === "hard" || value === "easy" ? value : "easy";
}

function normalizeStatus(data: Record<string, unknown>): NormalizedGameHistoryRecord["status"] {
  if (data.status === "won" || data.status === "lost" || data.status === "unfinished") {
    return data.status;
  }

  if (data.won === true) {
    return "won";
  }

  if (data.won === false && data.completed === true) {
    return "lost";
  }

  return "unfinished";
}

function getDateValue(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    const toDate = (value as { toDate?: unknown }).toDate;

    if (typeof toDate === "function") {
      const date = toDate.call(value);
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    }
  }

  return null;
}

function getOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
}

function getSafeCount(value: unknown): number {
  return getOptionalNumber(value) ?? 0;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function calculateWinRate(wins: number, completedGames: number) {
  return completedGames > 0 ? Math.round((wins / completedGames) * 100) : 0;
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function isCompletedGame(game: NormalizedGameHistoryRecord) {
  return game.status === "won" || game.status === "lost";
}

function sortByCompletedAtDesc(first: NormalizedGameHistoryRecord, second: NormalizedGameHistoryRecord) {
  return getTime(second.completedAt) - getTime(first.completedAt);
}

function sortByCompletedAtAsc(first: NormalizedGameHistoryRecord, second: NormalizedGameHistoryRecord) {
  return getTime(first.completedAt) - getTime(second.completedAt);
}

function getTime(date: Date | null) {
  return date?.getTime() ?? 0;
}
