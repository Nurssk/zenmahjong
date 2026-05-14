import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { LeaderboardEntry } from "@/src/lib/leaderboard/demo-leaderboard";

export const TOURNAMENT_SCORE_STORAGE_KEY = "zen-mahjong:tournament-score";

export type SavedTournamentScore = {
  userId?: string;
  name: string;
  city?: string;
  score: number;
  timeSeconds: number;
  completedAt: string;
  date: string;
  mode: "tournament";
};

export type RankedLeaderboardEntry = LeaderboardEntry & {
  rank: number;
};

export function saveTournamentScoreLocal(score: SavedTournamentScore): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(TOURNAMENT_SCORE_STORAGE_KEY, JSON.stringify(normalizeSavedScore(score)));
}

export function getTournamentScoreLocal(): SavedTournamentScore | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawScore = window.localStorage.getItem(TOURNAMENT_SCORE_STORAGE_KEY);

  if (!rawScore) {
    return null;
  }

  try {
    return parseSavedTournamentScore(JSON.parse(rawScore));
  } catch {
    return null;
  }
}

export async function saveTournamentScoreFirestore(score: SavedTournamentScore): Promise<boolean> {
  if (!db || !score.userId) {
    return false;
  }

  try {
    await setDoc(
      doc(db, "users", score.userId, "tournamentScores", "current"),
      {
        ...normalizeSavedScore(score),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return true;
  } catch {
    return false;
  }
}

export function mergeLeaderboardEntries(
  entries: readonly LeaderboardEntry[],
  currentScore?: SavedTournamentScore | null,
): RankedLeaderboardEntry[] {
  const entryMap = new Map<string, LeaderboardEntry>();

  for (const entry of entries) {
    entryMap.set(entry.id, entry);
  }

  if (currentScore) {
    const currentEntry = savedScoreToLeaderboardEntry(currentScore);
    entryMap.set(currentEntry.id, currentEntry);
  }

  return Array.from(entryMap.values())
    .sort(compareLeaderboardEntries)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function savedScoreToLeaderboardEntry(score: SavedTournamentScore): LeaderboardEntry {
  const normalizedScore = normalizeSavedScore(score);

  return {
    id: normalizedScore.userId ?? "current-local-player",
    name: normalizedScore.name,
    city: normalizedScore.city ?? "Алматы",
    country: "Казахстан",
    score: normalizedScore.score,
    timeSeconds: normalizedScore.timeSeconds,
    completedAt: normalizedScore.completedAt,
    mode: "tournament",
    isCurrentUser: true,
  };
}

export function compareLeaderboardEntries(first: LeaderboardEntry, second: LeaderboardEntry): number {
  if (first.score !== second.score) {
    return second.score - first.score;
  }

  if (first.timeSeconds !== second.timeSeconds) {
    return first.timeSeconds - second.timeSeconds;
  }

  return first.completedAt.localeCompare(second.completedAt);
}

function normalizeSavedScore(score: SavedTournamentScore): SavedTournamentScore {
  const userId = normalizeOptionalString(score.userId);
  const city = normalizeOptionalString(score.city);

  return {
    ...(userId ? { userId } : {}),
    name: normalizeOptionalString(score.name) ?? "Игрок Zen Mahjong",
    ...(city ? { city } : {}),
    score: Math.max(0, Math.round(score.score)),
    timeSeconds: Math.max(0, Math.round(score.timeSeconds)),
    completedAt: normalizeIsoDate(score.completedAt),
    date: normalizeOptionalString(score.date) ?? new Date().toISOString().slice(0, 10),
    mode: "tournament",
  };
}

function parseSavedTournamentScore(value: unknown): SavedTournamentScore | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name : "";
  const userId = typeof data.userId === "string" ? data.userId : undefined;
  const city = typeof data.city === "string" ? data.city : undefined;
  const score = typeof data.score === "number" && Number.isFinite(data.score) ? data.score : null;
  const timeSeconds = typeof data.timeSeconds === "number" && Number.isFinite(data.timeSeconds) ? data.timeSeconds : null;
  const completedAt = typeof data.completedAt === "string" ? data.completedAt : "";
  const date = typeof data.date === "string" ? data.date : "";

  if (score === null || timeSeconds === null) {
    return null;
  }

  return normalizeSavedScore({
    ...(userId ? { userId } : {}),
    name,
    ...(city ? { city } : {}),
    score,
    timeSeconds,
    completedAt,
    date,
    mode: "tournament",
  });
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeIsoDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
