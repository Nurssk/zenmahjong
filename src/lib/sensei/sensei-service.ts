import { collection, doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { DEFAULT_ECONOMY, ECONOMY_UPDATED_EVENT } from "@/src/lib/economy/economy-service";
import type { PlayerEconomy } from "@/src/lib/economy/economy-types";
import { DEFAULT_SENSEI_ID, normalizeSenseiId, type SenseiId } from "@/src/lib/sensei/sensei-characters";

export const UGWAY_PRODUCT_ID = "sensei_ugway";
export const UGWAY_PRICE_GEMS = 1000;
export const SENSEI_UPDATED_EVENT = "zen-mahjong:sensei-updated";

export type SenseiProfile = {
  ownedSenseis: SenseiId[];
  selectedSensei: SenseiId;
};

export class InsufficientGemsError extends Error {
  constructor() {
    super("Not enough gems to purchase Ugway.");
    this.name = "InsufficientGemsError";
  }
}

export function createDefaultSenseiProfile(): SenseiProfile {
  return {
    ownedSenseis: [DEFAULT_SENSEI_ID],
    selectedSensei: DEFAULT_SENSEI_ID,
  };
}

export async function getSenseiProfile(userId?: string): Promise<SenseiProfile> {
  if (!userId || !db) {
    return createDefaultSenseiProfile();
  }

  const snapshot = await getDoc(doc(db, "users", userId));
  return normalizeSenseiProfile(snapshot.exists() ? snapshot.data() : null);
}

export async function selectSensei(userId: string, senseiId: SenseiId): Promise<SenseiProfile> {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const userRef = doc(db, "users", userId);
  const profile = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const currentProfile = normalizeSenseiProfile(snapshot.exists() ? snapshot.data() : null);
    const ownedSenseis = new Set<SenseiId>(currentProfile.ownedSenseis);
    ownedSenseis.add(DEFAULT_SENSEI_ID);

    if (!ownedSenseis.has(senseiId)) {
      throw new Error("Sensei is not owned.");
    }

    const nextProfile = {
      ownedSenseis: [...ownedSenseis],
      selectedSensei: senseiId,
    };

    transaction.set(
      userRef,
      {
        ownedSenseis: nextProfile.ownedSenseis,
        selectedSensei: nextProfile.selectedSensei,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return nextProfile;
  });

  dispatchSenseiUpdate(profile);
  return profile;
}

export async function purchaseUgway(userId: string): Promise<{
  economy: PlayerEconomy;
  profile: SenseiProfile;
  purchased: boolean;
}> {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const userRef = doc(db, "users", userId);
  const economyRef = doc(db, "users", userId, "economy", "current");
  const orderRef = doc(collection(db, "users", userId, "orders"));

  const result = await runTransaction(db, async (transaction) => {
    const [userSnapshot, economySnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(economyRef),
    ]);
    const currentProfile = normalizeSenseiProfile(userSnapshot.exists() ? userSnapshot.data() : null);
    const ownedSenseis = new Set<SenseiId>(currentProfile.ownedSenseis);
    ownedSenseis.add(DEFAULT_SENSEI_ID);

    if (ownedSenseis.has("ugway")) {
      return {
        economy: normalizeEconomySnapshot(economySnapshot.exists() ? economySnapshot.data() : null, userId),
        profile: {
          ownedSenseis: [...ownedSenseis],
          selectedSensei: currentProfile.selectedSensei,
        },
        purchased: false,
      };
    }

    const currentEconomy = normalizeEconomySnapshot(economySnapshot.exists() ? economySnapshot.data() : null, userId);

    if (currentEconomy.gems < UGWAY_PRICE_GEMS) {
      throw new InsufficientGemsError();
    }

    const nextEconomy: PlayerEconomy = {
      ...currentEconomy,
      gems: currentEconomy.gems - UGWAY_PRICE_GEMS,
      updatedAt: new Date().toISOString(),
    };
    const nextProfile: SenseiProfile = {
      ownedSenseis: [...ownedSenseis, "ugway"],
      selectedSensei: "ugway",
    };

    transaction.set(
      economyRef,
      {
        ...nextEconomy,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
    transaction.set(
      userRef,
      {
        gems: nextEconomy.gems,
        ownedSenseis: nextProfile.ownedSenseis,
        selectedSensei: nextProfile.selectedSensei,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    transaction.set(orderRef, {
      userId,
      productId: UGWAY_PRODUCT_ID,
      productName: "Угвей",
      type: "sensei_character",
      amount: UGWAY_PRICE_GEMS,
      currency: "gems",
      status: "paid",
      provider: "in_app_gems",
      createdAt: serverTimestamp(),
      paidAt: serverTimestamp(),
    });

    return {
      economy: nextEconomy,
      profile: nextProfile,
      purchased: true,
    };
  });

  dispatchEconomyUpdate(result.economy);
  dispatchSenseiUpdate(result.profile);
  return result;
}

export async function ensureAiroProfile(userId: string) {
  if (!db) {
    return createDefaultSenseiProfile();
  }

  const profile = await getSenseiProfile(userId);
  const ownedSenseis = new Set<SenseiId>(profile.ownedSenseis);
  ownedSenseis.add(DEFAULT_SENSEI_ID);

  await setDoc(
    doc(db, "users", userId),
    {
      ownedSenseis: [...ownedSenseis],
      selectedSensei: profile.selectedSensei,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    ownedSenseis: [...ownedSenseis],
    selectedSensei: profile.selectedSensei,
  };
}

function normalizeSenseiProfile(value: unknown): SenseiProfile {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const ownedSenseis = Array.isArray(data.ownedSenseis)
    ? data.ownedSenseis.map(normalizeSenseiId)
    : [DEFAULT_SENSEI_ID];
  const uniqueOwnedSenseis = new Set<SenseiId>(ownedSenseis);
  uniqueOwnedSenseis.add(DEFAULT_SENSEI_ID);
  const selectedSensei = normalizeSenseiId(data.selectedSensei);

  return {
    ownedSenseis: [...uniqueOwnedSenseis],
    selectedSensei: uniqueOwnedSenseis.has(selectedSensei) ? selectedSensei : DEFAULT_SENSEI_ID,
  };
}

function normalizeEconomySnapshot(value: unknown, userId: string): PlayerEconomy {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    userId,
    coins: normalizeNumber(data.coins, DEFAULT_ECONOMY.coins),
    gems: normalizeNumber(data.gems, DEFAULT_ECONOMY.gems),
    hints: normalizeNumber(data.hints, DEFAULT_ECONOMY.hints),
    undos: normalizeNumber(data.undos, DEFAULT_ECONOMY.undos),
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeNumber(value: unknown, fallback: number) {
  return Math.max(0, Math.round(typeof value === "number" && Number.isFinite(value) ? value : fallback));
}

function dispatchEconomyUpdate(economy: PlayerEconomy) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ECONOMY_UPDATED_EVENT, { detail: economy }));
}

function dispatchSenseiUpdate(profile: SenseiProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SENSEI_UPDATED_EVENT, { detail: profile }));
}
