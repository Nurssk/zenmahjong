import { generateBoard } from "@/src/lib/game/engine";
import type { MahjongTileModel } from "@/src/lib/game/types";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_TOURNAMENT_SEED_PREFIX = "zen-mahjong-daily-tournament";

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createDailySeed(dateKey: string): string {
  assertDateKey(dateKey);

  return `${DAILY_TOURNAMENT_SEED_PREFIX}:${dateKey}`;
}

export function generateDailyTournamentLayout(dateKey: string): MahjongTileModel[] {
  return generateBoard(createDailySeed(dateKey));
}

export function seededRandom(seed: string): () => number {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function assertDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error(`Invalid daily tournament date key: ${dateKey}. Expected YYYY-MM-DD.`);
  }
}
