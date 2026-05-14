import type {
  GameDifficulty,
  GameMode,
  GameResult,
  GameResultReason,
  GameResultStatus,
} from "@/src/lib/stats/stats-types";
import { collection, doc, getDocs, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export const GAME_HISTORY_KEY = "zen-mahjong:game-history";
export const GAME_HISTORY_STORAGE_KEY = GAME_HISTORY_KEY;
export const STATS_UPDATED_EVENT = "zen-mahjong:stats-updated";

export type BuildGameResultFromStateParams = {
  id: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  status: GameResultStatus;
  reason: GameResultReason;
  score: number;
  timeSeconds: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  maxCombo?: number;
  hintsUsed?: number;
  undoUsed?: number;
  startedAt: string;
  endedAt?: string;
};

export function getGameHistoryLocal(): GameResult[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const rawHistory = window.localStorage.getItem(GAME_HISTORY_KEY);

  if (!rawHistory) {
    window.localStorage.setItem(GAME_HISTORY_KEY, "[]");
    return [];
  }

  try {
    const parsed = JSON.parse(rawHistory);

    if (!Array.isArray(parsed)) {
      resetHistory();
      return [];
    }

    return parsed.flatMap((item) => parseGameResult(item)).sort(sortNewestFirst);
  } catch {
    resetHistory();
    return [];
  }
}

export function saveGameResultLocal(result: GameResult): void {
  updateGameResultLocal(result);
}

export async function getGameHistoryFirestore(uid: string | null | undefined): Promise<GameResult[]> {
  if (!db || !uid) {
    return [];
  }

  const snapshot = await getDocs(collection(db, "users", uid, "gameHistory"));

  return snapshot.docs
    .flatMap((item) => parseGameResult({ id: item.id, ...item.data() }, item.id))
    .sort(sortNewestFirst)
    .slice(0, 100);
}

export async function saveGameResultFirestore(
  uid: string | null | undefined,
  result: GameResult,
): Promise<boolean> {
  if (!db || !uid) {
    return false;
  }

  const normalizedResult = normalizeGameResult(result);
  const resultRef = doc(db, "users", uid, "gameHistory", normalizedResult.id);

  await setDoc(
    resultRef,
    stripUndefined({
      ...normalizedResult,
      ...buildCompletedGameCompatibilityFields(normalizedResult),
      syncedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STATS_UPDATED_EVENT, { detail: normalizedResult }));
  }

  return true;
}

export async function saveGameResultWithFallback(
  result: GameResult,
  uid: string | null | undefined,
): Promise<"firestore" | "local"> {
  if (uid) {
    try {
      const savedToFirestore = await saveGameResultFirestore(uid, result);

      if (savedToFirestore) {
        return "firestore";
      }
    } catch (error) {
      void error;
    }
  }

  saveGameResultLocal(result);

  return "local";
}

export function updateGameResultLocal(result: GameResult): void {
  if (!canUseLocalStorage()) {
    return;
  }

  const normalizedResult = normalizeGameResult(result);
  const nextHistory = [
    normalizedResult,
    ...getGameHistoryLocal().filter((item) => item.id !== normalizedResult.id),
  ]
    .sort(sortNewestFirst)
    .slice(0, 100);

  window.localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new CustomEvent(STATS_UPDATED_EVENT, { detail: normalizedResult }));
}

export function buildGameResultFromState(params: BuildGameResultFromStateParams): GameResult {
  const endedAt = normalizeIsoDate(params.endedAt ?? new Date().toISOString());
  const startedAt = normalizeIsoDate(params.startedAt);
  const status = params.status;

  return normalizeGameResult({
    id: params.id,
    mode: params.mode,
    difficulty: params.difficulty,
    status,
    score: params.score,
    timeSeconds: params.timeSeconds,
    moves: params.moves,
    matchedPairs: params.matchedPairs,
    totalPairs: params.totalPairs,
    ...(typeof params.maxCombo === "number" ? { maxCombo: params.maxCombo } : {}),
    ...(typeof params.hintsUsed === "number" ? { hintsUsed: params.hintsUsed } : {}),
    ...(typeof params.undoUsed === "number" ? { undoUsed: params.undoUsed } : {}),
    startedAt,
    endedAt,
    date: endedAt.slice(0, 10),
    reason: params.reason,
    completed: status === "won" || status === "lost",
    won: status === "won",
  });
}

function parseGameResult(value: unknown, fallbackId?: string): GameResult[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const data = value as Record<string, unknown>;
  const id = getString(data.id) || getString(fallbackId);
  const mode = getGameMode(data.mode) ?? "regular";
  const difficulty = getDifficulty(data.difficulty);
  const endedAt = getDateValue(data.endedAt) ?? getDateValue(data.playedAt) ?? getDateValue(data.completedAt);

  if (!id || !mode || !difficulty || !endedAt) {
    return [];
  }

  const status = getStatus(data.status) ?? inferLegacyStatus(data);
  const timeSeconds = getNumber(data.timeSeconds, getNumber(data.elapsedSeconds));
  const moves = getNumber(data.moves, getNumber(data.movesCount));
  const matchedPairs = getNumber(data.matchedPairs, moves);
  const startedAt = getDateValue(data.startedAt) ?? subtractSeconds(endedAt, timeSeconds);
  const reason = getReason(data.reason) ?? inferReason(status);

  return [
    normalizeGameResult({
      id,
      mode,
      difficulty,
      status,
      score: getNumber(data.score),
      timeSeconds,
      moves,
      matchedPairs,
      totalPairs: getNumber(data.totalPairs, 72),
      maxCombo: getOptionalNumber(data.maxCombo),
      hintsUsed: getOptionalNumber(data.hintsUsed),
      undoUsed: getOptionalNumber(data.undoUsed),
      startedAt,
      endedAt,
      date: getString(data.date) || endedAt.slice(0, 10),
      reason,
      completed: Boolean(data.completed) || status === "won" || status === "lost",
      won: Boolean(data.won) || status === "won",
    }),
  ];
}

function normalizeGameResult(result: GameResult): GameResult {
  const endedAt = normalizeIsoDate(result.endedAt);
  const startedAt = normalizeIsoDate(result.startedAt);
  const totalPairs = Math.max(1, Math.round(result.totalPairs));
  const matchedPairs = clamp(Math.round(result.matchedPairs), 0, totalPairs);
  const status = result.status;

  return {
    id: result.id.trim() || `game-${endedAt}`,
    mode: result.mode,
    difficulty: result.difficulty,
    status,
    score: Math.max(0, Math.round(result.score)),
    timeSeconds: Math.max(0, Math.round(result.timeSeconds)),
    moves: Math.max(0, Math.round(result.moves)),
    matchedPairs,
    totalPairs,
    ...(typeof result.maxCombo === "number" ? { maxCombo: Math.max(0, Math.round(result.maxCombo)) } : {}),
    ...(typeof result.hintsUsed === "number" ? { hintsUsed: Math.max(0, Math.round(result.hintsUsed)) } : {}),
    ...(typeof result.undoUsed === "number" ? { undoUsed: Math.max(0, Math.round(result.undoUsed)) } : {}),
    startedAt,
    endedAt,
    date: result.date || endedAt.slice(0, 10),
    reason: result.reason,
    completed: status === "won" || status === "lost",
    won: status === "won",
  };
}

function inferLegacyStatus(data: Record<string, unknown>): GameResultStatus {
  const completed = typeof data.completed === "boolean" ? data.completed : null;
  const won = typeof data.won === "boolean" ? data.won : null;

  if (Boolean(data.won)) {
    return "won";
  }

  if (completed && won === false) {
    return "lost";
  }

  if (completed || data.completedAt) {
    return "won";
  }

  return "unfinished";
}

function inferReason(status: GameResultStatus): GameResultReason {
  if (status === "won") {
    return "win";
  }

  if (status === "lost") {
    return "no_moves";
  }

  return "exit";
}

function getGameMode(value: unknown): GameMode | null {
  return value === "regular" || value === "daily" || value === "tournament" ? value : null;
}

function getDifficulty(value: unknown): GameDifficulty | null {
  return value === "easy" || value === "medium" || value === "hard" ? value : null;
}

function getStatus(value: unknown): GameResultStatus | null {
  return value === "won" || value === "lost" || value === "unfinished" ? value : null;
}

function getReason(value: unknown): GameResultReason | null {
  return value === "win" || value === "no_moves" || value === "new_game" || value === "exit" || value === "restart"
    ? value
    : null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getIsoDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getDateValue(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeDate = (value as { toDate?: unknown }).toDate;

    if (typeof maybeDate === "function") {
      const date = maybeDate.call(value);

      return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
    }
  }

  return getIsoDate(value);
}

function normalizeIsoDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function subtractSeconds(isoDate: string, seconds: number) {
  return new Date(new Date(isoDate).getTime() - Math.max(0, seconds) * 1000).toISOString();
}

function sortNewestFirst(first: GameResult, second: GameResult) {
  return second.endedAt.localeCompare(first.endedAt);
}

function resetHistory() {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(GAME_HISTORY_KEY, "[]");
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function buildCompletedGameCompatibilityFields(result: GameResult) {
  if (result.status !== "won") {
    return {};
  }

  return {
    layoutId: "classic-turtle",
    elapsedSeconds: result.timeSeconds,
    movesCount: result.moves,
    completedAt: Timestamp.fromDate(new Date(result.endedAt)),
    focusScore: Math.max(0, result.score - (result.hintsUsed ?? 0) * 10),
  };
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
