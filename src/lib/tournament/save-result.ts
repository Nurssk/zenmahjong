import { doc, getDoc, serverTimestamp, setDoc, type DocumentReference } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export type TournamentResultComparable = {
  score: number;
  elapsedSeconds: number;
  hintsUsed: number;
};

export type TournamentResultInput = TournamentResultComparable & {
  dateKey: string;
  uid: string;
  name: string;
  photoURL?: string | null;
  city?: string | null;
  movesCount: number;
  shufflesUsed: number;
};

export type SavedTournamentResult = TournamentResultInput & {
  completed: boolean;
  completedAt?: unknown;
  updatedAt?: unknown;
};

export type SaveTournamentResultResponse = {
  saved: boolean;
  reason: "created" | "improved" | "existing-better" | "firebase-unavailable";
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayTournamentDoc(dateKey: string, uid: string): DocumentReference | null {
  assertDateKey(dateKey);

  if (!db) {
    return null;
  }

  return doc(db, "dailyChallenges", dateKey, "results", uid);
}

export function isBetterTournamentResult(
  newResult: TournamentResultComparable,
  oldResult: TournamentResultComparable | null | undefined,
) {
  if (!oldResult) {
    return true;
  }

  if (newResult.score !== oldResult.score) {
    return newResult.score > oldResult.score;
  }

  if (newResult.elapsedSeconds !== oldResult.elapsedSeconds) {
    return newResult.elapsedSeconds < oldResult.elapsedSeconds;
  }

  return newResult.hintsUsed < oldResult.hintsUsed;
}

export async function saveTournamentResult(params: TournamentResultInput): Promise<SaveTournamentResultResponse> {
  const resultRef = getTodayTournamentDoc(params.dateKey, params.uid);

  if (!resultRef) {
    return { saved: false, reason: "firebase-unavailable" };
  }

  const existingSnapshot = await getDoc(resultRef);
  const oldResult = existingSnapshot.exists() ? deserializeComparableResult(existingSnapshot.data()) : null;

  if (existingSnapshot.exists() && !isBetterTournamentResult(params, oldResult)) {
    return { saved: false, reason: "existing-better" };
  }

  const payload: SavedTournamentResult = {
    dateKey: params.dateKey,
    uid: params.uid,
    name: params.name.trim() || "Игрок Zen Mahjong",
    score: params.score,
    elapsedSeconds: params.elapsedSeconds,
    movesCount: params.movesCount,
    hintsUsed: params.hintsUsed,
    shufflesUsed: params.shufflesUsed,
    completed: true,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (params.photoURL) {
    payload.photoURL = params.photoURL;
  }

  if (params.city) {
    payload.city = params.city;
  }

  await setDoc(resultRef, payload, { merge: true });

  return { saved: true, reason: existingSnapshot.exists() ? "improved" : "created" };
}

function deserializeComparableResult(data: Record<string, unknown>): TournamentResultComparable | null {
  const score = getFiniteNumber(data.score);
  const elapsedSeconds = getFiniteNumber(data.elapsedSeconds);
  const hintsUsed = getFiniteNumber(data.hintsUsed);

  if (score === null || elapsedSeconds === null || hintsUsed === null) {
    return null;
  }

  return { score, elapsedSeconds, hintsUsed };
}

function getFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function assertDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error(`Invalid tournament date key: ${dateKey}. Expected YYYY-MM-DD.`);
  }
}
