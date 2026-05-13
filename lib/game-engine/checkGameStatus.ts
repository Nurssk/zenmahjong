import type { GameStatus, Tile } from "@/types";

export function checkGameStatus(tiles: Tile[]): GameStatus {
  return tiles.every((tile) => tile.removed) ? "won" : "playing";
}
