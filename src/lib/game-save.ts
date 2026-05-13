import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { GameMove, MahjongTileModel, TileCoordinate } from "@/src/lib/game";

export type SavedGameDifficulty = "easy" | "medium" | "hard";

export type SavedGameMove = GameMove & {
  pointsEarned?: number;
  comboAtMove?: number;
  timestamp?: number;
};

export type CurrentGameSaveInput = {
  layoutId: string;
  difficulty: SavedGameDifficulty;
  tiles: MahjongTileModel[];
  removedTileIds: string[];
  selectedTileId?: string | null;
  score: number;
  comboMultiplier: number;
  elapsedSeconds: number;
  moves: SavedGameMove[];
  undoStack: SavedGameMove[];
  hintsUsed: number;
  shufflesUsed: number;
  isPaused: boolean;
};

export type CurrentGameSave = CurrentGameSaveInput & {
  savedAt?: unknown;
  updatedAt?: unknown;
};

export type CompletedGameResult = {
  layoutId: string;
  difficulty: SavedGameDifficulty | string;
  score: number;
  elapsedSeconds: number;
  movesCount: number;
  hintsUsed: number;
  shufflesUsed: number;
  focusScore?: number;
};

export type CompletedGame = CompletedGameResult & {
  id: string;
  completedAt?: unknown;
};

export type GameDashboardSummary = {
  currentSave: CurrentGameSave | null;
  recentGames: CompletedGame[];
  bestScore: number;
  fastestTime: number | null;
};

export async function saveCurrentGame(uid: string, gameState: CurrentGameSaveInput) {
  if (!db) {
    return;
  }

  const saveRef = doc(db, "users", uid, "gameSaves", "current");
  const existing = await getDoc(saveRef);

  await setDoc(
    saveRef,
    {
      ...serializeCurrentGame(gameState),
      savedAt: existing.exists() ? existing.data().savedAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadCurrentGame(uid: string): Promise<CurrentGameSave | null> {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "users", uid, "gameSaves", "current"));

  if (!snapshot.exists()) {
    return null;
  }

  return deserializeCurrentGame(snapshot.data());
}

export async function clearCurrentGame(uid: string) {
  if (!db) {
    return;
  }

  await deleteDoc(doc(db, "users", uid, "gameSaves", "current"));
}

export async function saveCompletedGame(uid: string, result: CompletedGameResult) {
  if (!db) {
    return;
  }

  await addDoc(collection(db, "users", uid, "gameHistory"), {
    ...result,
    completedAt: serverTimestamp(),
  });
}

export async function loadRecentCompletedGames(uid: string, count = 5): Promise<CompletedGame[]> {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, "users", uid, "gameHistory"), orderBy("completedAt", "desc"), limit(count)),
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<CompletedGame, "id">),
  }));
}

export async function loadGameDashboardSummary(uid: string): Promise<GameDashboardSummary> {
  if (!db) {
    return {
      currentSave: null,
      recentGames: [],
      bestScore: 0,
      fastestTime: null,
    };
  }

  const [currentSave, recentGames, allGamesSnapshot] = await Promise.all([
    loadCurrentGame(uid),
    loadRecentCompletedGames(uid, 5),
    getDocs(collection(db, "users", uid, "gameHistory")),
  ]);

  const allGames = allGamesSnapshot.docs.map((item) => item.data() as CompletedGameResult);
  const bestScore = allGames.reduce((best, game) => Math.max(best, Number(game.score) || 0), 0);
  const fastestTime = allGames.reduce<number | null>((fastest, game) => {
    const elapsedSeconds = Number(game.elapsedSeconds) || 0;

    if (elapsedSeconds <= 0) {
      return fastest;
    }

    return fastest === null ? elapsedSeconds : Math.min(fastest, elapsedSeconds);
  }, null);

  return {
    currentSave,
    recentGames,
    bestScore,
    fastestTime,
  };
}

function serializeCurrentGame(gameState: CurrentGameSaveInput) {
  return {
    ...gameState,
    selectedTileId: gameState.selectedTileId ?? null,
    tiles: gameState.tiles.map(serializeTile),
    moves: gameState.moves.map(serializeMove),
    undoStack: gameState.undoStack.map(serializeMove),
  };
}

function serializeTile(tile: MahjongTileModel) {
  return {
    id: tile.id,
    coord: [...tile.coord],
    x: tile.x,
    y: tile.y,
    z: tile.z,
    removed: tile.removed,
    type: tile.type,
    family: tile.family,
    rank: tile.rank,
    label: tile.label,
    symbol: tile.symbol,
    imageSrc: tile.imageSrc ?? null,
  };
}

function serializeMove(move: SavedGameMove) {
  return {
    firstId: move.firstId,
    secondId: move.secondId,
    ...(typeof move.pointsEarned === "number" ? { pointsEarned: move.pointsEarned } : {}),
    ...(typeof move.comboAtMove === "number" ? { comboAtMove: move.comboAtMove } : {}),
    ...(typeof move.timestamp === "number" ? { timestamp: move.timestamp } : {}),
  };
}

function deserializeCurrentGame(data: Record<string, unknown>): CurrentGameSave {
  const moves = deserializeMoves(data.moves);
  const undoStack = deserializeMoves(data.undoStack);

  return {
    layoutId: getString(data.layoutId, "classic-turtle"),
    difficulty: getDifficulty(data.difficulty),
    tiles: deserializeTiles(data.tiles),
    removedTileIds: getStringArray(data.removedTileIds),
    selectedTileId: typeof data.selectedTileId === "string" ? data.selectedTileId : null,
    score: getNumber(data.score),
    comboMultiplier: Math.max(1, getNumber(data.comboMultiplier, 1)),
    elapsedSeconds: getNumber(data.elapsedSeconds),
    moves,
    undoStack: undoStack.length > 0 ? undoStack : moves,
    hintsUsed: getNumber(data.hintsUsed),
    shufflesUsed: getNumber(data.shufflesUsed),
    isPaused: Boolean(data.isPaused),
    savedAt: data.savedAt,
    updatedAt: data.updatedAt,
  };
}

function deserializeTiles(value: unknown): MahjongTileModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const data = item as Record<string, unknown>;
    const coord = deserializeCoordinate(data.coord);

    if (!coord) {
      return [];
    }

    const imageSrc = typeof data.imageSrc === "string" ? data.imageSrc : undefined;

    return [
      {
        id: getString(data.id),
        coord,
        x: getNumber(data.x),
        y: getNumber(data.y),
        z: getNumber(data.z),
        removed: Boolean(data.removed),
        type: getString(data.type),
        family: getString(data.family) as MahjongTileModel["family"],
        rank: getNumber(data.rank),
        label: getString(data.label),
        symbol: getString(data.symbol),
        ...(imageSrc ? { imageSrc } : {}),
      },
    ];
  });
}

function deserializeCoordinate(value: unknown): TileCoordinate | null {
  if (!Array.isArray(value) || value.length !== 3) {
    return null;
  }

  return [getNumber(value[0]), getNumber(value[1]), getNumber(value[2])];
}

function deserializeMoves(value: unknown): SavedGameMove[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const data = item as Record<string, unknown>;
    const firstId = getString(data.firstId);
    const secondId = getString(data.secondId);

    if (!firstId || !secondId) {
      return [];
    }

    return [
      {
        firstId,
        secondId,
        pointsEarned: getOptionalNumber(data.pointsEarned),
        comboAtMove: getOptionalNumber(data.comboAtMove),
        timestamp: getOptionalNumber(data.timestamp),
      },
    ];
  });
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getDifficulty(value: unknown): SavedGameDifficulty {
  return value === "medium" || value === "hard" ? value : "easy";
}
