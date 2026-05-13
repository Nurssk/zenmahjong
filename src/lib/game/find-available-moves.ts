import { isCoordinateFree } from "@/src/lib/game/coordinates";
import type { MahjongTileModel, TilePair } from "@/src/lib/game/types";

export function findAvailableMoves(tiles: readonly MahjongTileModel[]): TilePair[] {
  const activeTiles = tiles.filter((tile) => !tile.removed);
  const activeCoords = activeTiles.map((tile) => tile.coord);
  const freeTilesByType = new Map<string, MahjongTileModel[]>();

  for (const tile of activeTiles) {
    if (!isCoordinateFree(tile.coord, activeCoords)) {
      continue;
    }

    const matchingTiles = freeTilesByType.get(tile.type);

    if (matchingTiles) {
      matchingTiles.push(tile);
    } else {
      freeTilesByType.set(tile.type, [tile]);
    }
  }

  const moves: TilePair[] = [];

  for (const matchingTiles of freeTilesByType.values()) {
    for (let firstIndex = 0; firstIndex < matchingTiles.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < matchingTiles.length; secondIndex += 1) {
        moves.push({
          firstId: matchingTiles[firstIndex].id,
          secondId: matchingTiles[secondIndex].id,
        });
      }
    }
  }

  return moves;
}

