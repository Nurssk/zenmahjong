import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { MahjongTileModel, TileCoordinate } from "@/src/lib/game";

export type TournamentSaveState = {
  dateKey: string;
  difficulty: "hard";
  tiles: MahjongTileModel[];
  removedTileIds: string[];
  selectedTileId: string | null;
  score: number;
  elapsedSeconds: number;
  comboMultiplier: number;
  shufflesUsed: number;
  completed: boolean;
  lost: boolean;
  updatedAt?: unknown;
};

export async function saveTournamentProgress(uid: string, dateKey: string, state: TournamentSaveState): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not configured");
    }

    await setDoc(
      getTournamentProgressRef(uid, dateKey),
      {
        ...serializeTournamentSaveState({ ...state, dateKey, difficulty: "hard" }),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    logTournamentSave("saved", {
      uid,
      dateKey,
      score: state.score,
      elapsedSeconds: state.elapsedSeconds,
    });
  } catch (error) {
    console.warn("[Tournament Save] failed", error);
    throw error;
  }
}

export async function loadTournamentProgress(uid: string, dateKey: string): Promise<TournamentSaveState | null> {
  try {
    if (!db) {
      throw new Error("Firestore is not configured");
    }

    const snapshot = await getDoc(getTournamentProgressRef(uid, dateKey));
    const save = snapshot.exists() ? deserializeTournamentSaveState(snapshot.data(), dateKey) : null;

    logTournamentSave("loaded", {
      uid,
      dateKey,
      exists: Boolean(save),
    });

    return save;
  } catch (error) {
    console.warn("[Tournament Save] failed", error);
    throw error;
  }
}

export async function clearTournamentProgress(uid: string, dateKey: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not configured");
    }

    await deleteDoc(getTournamentProgressRef(uid, dateKey));
  } catch (error) {
    console.warn("[Tournament Save] failed", error);
    throw error;
  }
}

function getTournamentProgressRef(uid: string, dateKey: string) {
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  return doc(db, "users", uid, "tournamentSaves", dateKey);
}

function serializeTournamentSaveState(state: TournamentSaveState) {
  return {
    dateKey: state.dateKey,
    difficulty: "hard",
    tiles: state.tiles.map(serializeTile),
    removedTileIds: state.removedTileIds,
    selectedTileId: state.selectedTileId ?? null,
    score: state.score,
    elapsedSeconds: state.elapsedSeconds,
    comboMultiplier: state.comboMultiplier,
    shufflesUsed: state.shufflesUsed,
    completed: state.completed,
    lost: state.lost,
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

function deserializeTournamentSaveState(data: Record<string, unknown>, fallbackDateKey: string): TournamentSaveState {
  const tiles = deserializeTiles(data.tiles);
  const removedTileIds = getStringArray(data.removedTileIds);

  return {
    dateKey: getString(data.dateKey, fallbackDateKey),
    difficulty: "hard",
    tiles,
    removedTileIds: removedTileIds.length > 0 ? removedTileIds : tiles.filter((tile) => tile.removed).map((tile) => tile.id),
    selectedTileId: typeof data.selectedTileId === "string" ? data.selectedTileId : null,
    score: getNumber(data.score),
    elapsedSeconds: getNumber(data.elapsedSeconds),
    comboMultiplier: Math.max(1, getNumber(data.comboMultiplier, 1)),
    shufflesUsed: getNumber(data.shufflesUsed),
    completed: Boolean(data.completed),
    lost: Boolean(data.lost),
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

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function logTournamentSave(action: "loaded" | "saved", payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Tournament Save] ${action}`, payload);
  }
}
