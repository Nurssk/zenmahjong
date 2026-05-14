import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export type DailyLeaderboardEntry = {
  rank: number;
  uid: string;
  name: string;
  photoURL?: string;
  city?: string;
  score: number;
  elapsedSeconds: number;
  movesCount: number;
  shufflesUsed: number;
  completedAt: Date | null;
};

export class DailyLeaderboardIndexError extends Error {
  constructor(cause: unknown) {
    super("Нужно создать индекс Firestore для рейтинга.");
    this.name = "DailyLeaderboardIndexError";
    this.cause = cause;
  }
}

const DEFAULT_LEADERBOARD_LIMIT = 50;

export async function getDailyLeaderboard(dateKey: string, limitCount = DEFAULT_LEADERBOARD_LIMIT) {
  assertDateKey(dateKey);

  if (!db) {
    return [];
  }

  try {
    const snapshot = await getDocs(
      query(
        collection(db, "dailyChallenges", dateKey, "results"),
        orderBy("score", "desc"),
        orderBy("elapsedSeconds", "asc"),
        orderBy("shufflesUsed", "asc"),
        orderBy("completedAt", "asc"),
        limit(limitCount),
      ),
    );

    return snapshot.docs.map((item, index) => deserializeLeaderboardEntry(item.data(), item.id, index + 1));
  } catch (error) {
    if (isFirestoreIndexError(error)) {
      throw new DailyLeaderboardIndexError(error);
    }

    throw error;
  }
}

export async function getUserDailyRank(dateKey: string, uid: string): Promise<DailyLeaderboardEntry | null> {
  assertDateKey(dateKey);

  if (!db || !uid) {
    return null;
  }

  try {
    const [userSnapshot, leaderboardSnapshot] = await Promise.all([
      getDoc(doc(db, "dailyChallenges", dateKey, "results", uid)),
      getDocs(
        query(
          collection(db, "dailyChallenges", dateKey, "results"),
          orderBy("score", "desc"),
          orderBy("elapsedSeconds", "asc"),
          orderBy("shufflesUsed", "asc"),
          orderBy("completedAt", "asc"),
        ),
      ),
    ]);

    if (!userSnapshot.exists()) {
      return null;
    }

    const rankIndex = leaderboardSnapshot.docs.findIndex((item) => item.id === uid);

    if (rankIndex === -1) {
      return deserializeLeaderboardEntry(userSnapshot.data(), uid, 0);
    }

    return deserializeLeaderboardEntry(userSnapshot.data(), uid, rankIndex + 1);
  } catch (error) {
    if (isFirestoreIndexError(error)) {
      throw new DailyLeaderboardIndexError(error);
    }

    throw error;
  }
}

function deserializeLeaderboardEntry(data: Record<string, unknown>, fallbackUid: string, rank: number): DailyLeaderboardEntry {
  const photoURL = getOptionalString(data.photoURL);
  const city = getOptionalString(data.city);

  return {
    rank,
    uid: getString(data.uid, fallbackUid),
    name: getString(data.name, "Игрок Zen Mahjong"),
    ...(photoURL ? { photoURL } : {}),
    ...(city ? { city } : {}),
    score: getNumber(data.score),
    elapsedSeconds: getNumber(data.elapsedSeconds),
    movesCount: getNumber(data.movesCount),
    shufflesUsed: getNumber(data.shufflesUsed),
    completedAt: toDate(data.completedAt),
  };
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date ? date : null;
  }

  return null;
}

function isFirestoreIndexError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: unknown; message?: unknown };
  const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";

  return maybeError.code === "failed-precondition" || message.includes("requires an index");
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function assertDateKey(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error(`Invalid tournament date key: ${dateKey}. Expected YYYY-MM-DD.`);
  }
}
