import type { Tile } from "@/types";

export function shuffleTiles(tiles: Tile[]) {
  return [...tiles].sort((a, b) => a.type.localeCompare(b.type));
}
