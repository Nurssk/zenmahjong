import type { Tile } from "@/types";

export function removePair(tiles: Tile[], pair: [string, string]) {
  return tiles.map((tile) =>
    pair.includes(tile.id) ? { ...tile, removed: true } : tile,
  );
}
