import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { HINT_PACKS, UNDO_PACKS } from "@/src/lib/economy/shop-catalog";
import type { ConsumableShopItem, PlayerEconomy } from "@/src/lib/economy/economy-types";

export type {
  CoinShopItem,
  ConsumableShopItem,
  DemoPaymentShopItem,
  GemShopItem,
  HintShopItem,
  PlayerEconomy,
  ShopItem,
  UndoShopItem,
} from "@/src/lib/economy/economy-types";

export const ECONOMY_STORAGE_KEY = "zen-mahjong:economy";
export const ECONOMY_UPDATED_EVENT = "zen-mahjong:economy-updated";

export const DEFAULT_ECONOMY = {
  coins: 500,
  gems: 0,
  hints: 3,
  undos: 3,
} as const;

export class InsufficientCoinsError extends Error {
  constructor(item: ConsumableShopItem) {
    super(`Not enough coins to purchase ${item.id}`);
    this.name = "InsufficientCoinsError";
  }
}

export class UnknownShopItemError extends Error {
  constructor(itemId: string) {
    super(`Unknown shop item: ${itemId}`);
    this.name = "UnknownShopItemError";
  }
}

export function createDefaultPlayerEconomy(userId?: string): PlayerEconomy {
  return normalizeEconomy(
    {
      ...(userId ? { userId } : {}),
      coins: DEFAULT_ECONOMY.coins,
      gems: DEFAULT_ECONOMY.gems,
      hints: DEFAULT_ECONOMY.hints,
      undos: DEFAULT_ECONOMY.undos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    userId,
  );
}

export async function getPlayerEconomy(userId?: string): Promise<PlayerEconomy> {
  if (userId) {
    if (!db) {
      return createDefaultPlayerEconomy(userId);
    }

    const economyRef = doc(db, "users", userId, "economy", "current");
    const snapshot = await getDoc(economyRef);

    if (snapshot.exists()) {
      return normalizeEconomy(snapshot.data(), userId);
    }

    const initialEconomy = createDefaultPlayerEconomy(userId);
    await setDoc(
      economyRef,
      {
        ...initialEconomy,
        userId,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
    dispatchEconomyUpdate(initialEconomy);
    return initialEconomy;
  }

  return getPlayerEconomyLocal();
}

export async function savePlayerEconomy(economy: PlayerEconomy, userId?: string): Promise<void> {
  const normalizedEconomy = normalizeEconomy(economy, userId);

  if (userId) {
    if (!db) {
      throw new Error("Firestore is not configured for account economy persistence.");
    }

    await setDoc(
      doc(db, "users", userId, "economy", "current"),
      {
        ...normalizedEconomy,
        userId,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
    dispatchEconomyUpdate(normalizedEconomy);
    return;
  }

  savePlayerEconomyLocal(normalizedEconomy);
}

export async function updateHintBalance(delta: number, userId?: string): Promise<PlayerEconomy> {
  return updateEconomy((economy) => ({
    ...economy,
    hints: economy.hints + delta,
  }), userId);
}

export async function updateUndoBalance(delta: number, userId?: string): Promise<PlayerEconomy> {
  return updateEconomy((economy) => ({
    ...economy,
    undos: economy.undos + delta,
  }), userId);
}

export async function updateCoinBalance(delta: number, userId?: string): Promise<PlayerEconomy> {
  return updateEconomy((economy) => ({
    ...economy,
    coins: economy.coins + delta,
  }), userId);
}

export async function updateGemBalance(delta: number, userId?: string): Promise<PlayerEconomy> {
  return updateEconomy((economy) => ({
    ...economy,
    gems: economy.gems + delta,
  }), userId);
}

export async function purchaseShopItem(itemId: string, userId?: string): Promise<PlayerEconomy> {
  const item = [...HINT_PACKS, ...UNDO_PACKS].find((shopItem) => shopItem.id === itemId);

  if (!item) {
    throw new UnknownShopItemError(itemId);
  }

  return updateEconomy((economy) => {
    if (economy.coins < item.priceCoins) {
      throw new InsufficientCoinsError(item);
    }

    return {
      ...economy,
      coins: economy.coins - item.priceCoins,
      hints: item.type === "hints" ? economy.hints + (item.quantity ?? 0) : economy.hints,
      undos: item.type === "undos" ? economy.undos + (item.quantity ?? 0) : economy.undos,
    };
  }, userId);
}

export function getPlayerEconomyLocal(): PlayerEconomy {
  if (!canUseLocalStorage()) {
    return createDefaultPlayerEconomy();
  }

  const rawEconomy = window.localStorage.getItem(ECONOMY_STORAGE_KEY);

  if (!rawEconomy) {
    const defaultEconomy = createDefaultPlayerEconomy();
    savePlayerEconomyLocal(defaultEconomy);
    return defaultEconomy;
  }

  try {
    return normalizeEconomy(JSON.parse(rawEconomy));
  } catch {
    const defaultEconomy = createDefaultPlayerEconomy();
    savePlayerEconomyLocal(defaultEconomy);
    return defaultEconomy;
  }
}

async function updateEconomy(
  update: (economy: PlayerEconomy) => PlayerEconomy,
  userId?: string,
): Promise<PlayerEconomy> {
  if (userId) {
    if (!db) {
      throw new Error("Firestore is not configured for account economy persistence.");
    }

    const economyRef = doc(db, "users", userId, "economy", "current");
    const nextEconomy = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(economyRef);
      const currentEconomy = snapshot.exists()
        ? normalizeEconomy(snapshot.data(), userId)
        : createDefaultPlayerEconomy(userId);
      const updatedEconomy = normalizeEconomy(
        {
          ...update(currentEconomy),
          createdAt: currentEconomy.createdAt,
          updatedAt: new Date().toISOString(),
        },
        userId,
      );

      transaction.set(
        economyRef,
        {
          ...updatedEconomy,
          userId,
          syncedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return updatedEconomy;
    });

    dispatchEconomyUpdate(nextEconomy);
    return nextEconomy;
  }

  const currentEconomy = getPlayerEconomyLocal();
  const nextEconomy = normalizeEconomy({
    ...update(currentEconomy),
    createdAt: currentEconomy.createdAt,
    updatedAt: new Date().toISOString(),
  });
  savePlayerEconomyLocal(nextEconomy);
  return nextEconomy;
}

function savePlayerEconomyLocal(economy: PlayerEconomy) {
  if (!canUseLocalStorage()) {
    return;
  }

  const normalizedEconomy = normalizeEconomy(economy);
  window.localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(normalizedEconomy));
  dispatchEconomyUpdate(normalizedEconomy);
}

function normalizeEconomy(value: unknown, userId?: string): PlayerEconomy {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const nextUserId = normalizeOptionalString(userId) ?? normalizeOptionalString(data.userId);
  const createdAt = normalizeOptionalIsoDate(data.createdAt) ?? normalizeIsoDate(data.updatedAt);

  return {
    ...(nextUserId ? { userId: nextUserId } : {}),
    coins: Math.max(0, Math.round(getNumber(data.coins, DEFAULT_ECONOMY.coins))),
    gems: Math.max(0, Math.round(getNumber(data.gems, DEFAULT_ECONOMY.gems))),
    hints: Math.max(0, Math.round(getNumber(data.hints, DEFAULT_ECONOMY.hints))),
    undos: Math.max(0, Math.round(getNumber(data.undos, DEFAULT_ECONOMY.undos))),
    createdAt,
    updatedAt: normalizeIsoDate(data.updatedAt),
  };
}

function dispatchEconomyUpdate(economy: PlayerEconomy) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ECONOMY_UPDATED_EVENT, { detail: economy }));
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeOptionalIsoDate(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeIsoDate(value: unknown) {
  return normalizeOptionalIsoDate(value) ?? new Date().toISOString();
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
