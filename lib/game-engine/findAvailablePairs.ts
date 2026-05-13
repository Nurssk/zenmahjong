import type { Tile } from "@/types";

export function findAvailablePairs(tiles: Tile[]) {
  return tiles.filter((tile) => !tile.removed).slice(0, 2);
}
