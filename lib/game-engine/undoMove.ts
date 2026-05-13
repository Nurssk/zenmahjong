import type { Tile } from "@/types";

export function undoMove(tiles: Tile[], pair: [string, string]) {
  return tiles.map((tile) =>
    pair.includes(tile.id) ? { ...tile, removed: false } : tile,
  );
}
