import type { Tile } from "@/types";

export function isTileFree(tile: Tile) {
  return !tile.removed;
}
