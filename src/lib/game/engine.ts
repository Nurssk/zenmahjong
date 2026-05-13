import { CLASSIC_TURTLE_COORDINATES, isCoordinateFree, tilesOverlap2D } from "@/src/lib/game/coordinates";
import { createTileFaces } from "@/src/lib/game/tile-faces";
import { shuffleList, shuffleListWithSeed } from "@/src/lib/game/utils";
import type { BoardState, GameMove, GameStatus, MahjongTileModel } from "@/src/lib/game/types";

export function generateBoard(seed = "zen-mahjong-classic-board"): MahjongTileModel[] {
  const faces = shuffleListWithSeed(createTileFaces(), seed);

  return CLASSIC_TURTLE_COORDINATES.map((coord, index) => {
    const face = faces[index];
    const [x, y, z] = coord;

    return {
      ...face,
      id: `tile-${index}-${coord.join("-")}`,
      coord,
      x,
      y,
      z,
      removed: false,
    };
  });
}

export function getActiveTiles(tiles: readonly MahjongTileModel[]) {
  return tiles.filter((tile) => !tile.removed);
}

export function isTileFree(tile: MahjongTileModel, tiles: readonly MahjongTileModel[]) {
  return !tile.removed && isCoordinateFree(tile.coord, getActiveTiles(tiles).map((activeTile) => activeTile.coord));
}

export function canRemovePair(first: MahjongTileModel, second: MahjongTileModel) {
  return first.id !== second.id && first.type === second.type;
}

export function removePair(tiles: readonly MahjongTileModel[], pair: GameMove) {
  return tiles.map((tile) =>
    tile.id === pair.firstId || tile.id === pair.secondId ? { ...tile, removed: true } : tile,
  );
}

export function findAvailablePairs(tiles: readonly MahjongTileModel[]) {
  const freeTiles = getActiveTiles(tiles).filter((tile) => isTileFree(tile, tiles));
  const pairs: GameMove[] = [];

  for (let firstIndex = 0; firstIndex < freeTiles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < freeTiles.length; secondIndex += 1) {
      const first = freeTiles[firstIndex];
      const second = freeTiles[secondIndex];

      if (canRemovePair(first, second)) {
        pairs.push({ firstId: first.id, secondId: second.id });
      }
    }
  }

  return pairs;
}

export function checkGameStatus(tiles: readonly MahjongTileModel[]): GameStatus {
  if (tiles.every((tile) => tile.removed)) {
    return "won";
  }

  return findAvailablePairs(tiles).length > 0 ? "playing" : "no-moves";
}

export function getHintPair(tiles: readonly MahjongTileModel[]) {
  return findAvailablePairs(tiles)[0] ?? null;
}

export function selectTile(state: BoardState, tileId: string): BoardState {
  const tile = state.tiles.find((item) => item.id === tileId);

  if (!tile || !isTileFree(tile, state.tiles)) {
    return state;
  }

  if (state.selectedTileId === tile.id) {
    return { ...state, selectedTileId: null };
  }

  if (!state.selectedTileId) {
    return { ...state, selectedTileId: tile.id };
  }

  const selectedTile = state.tiles.find((item) => item.id === state.selectedTileId);

  if (!selectedTile || !isTileFree(selectedTile, state.tiles)) {
    return { ...state, selectedTileId: tile.id };
  }

  if (!canRemovePair(selectedTile, tile)) {
    return { ...state, selectedTileId: tile.id };
  }

  const pair = { firstId: selectedTile.id, secondId: tile.id };
  const tiles = removePair(state.tiles, pair);
  const status = checkGameStatus(tiles);

  return {
    tiles,
    selectedTileId: null,
    hintPair: status === "playing" ? getHintPair(tiles) : null,
    removedPairs: [...state.removedPairs, pair],
    status,
  };
}

export function shuffleRemainingTiles(state: BoardState): BoardState {
  if (state.status === "won") {
    return state;
  }

  let tiles = state.tiles;
  let status: GameStatus = state.status;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const shuffledTiles = shuffleActiveTileFaces(state.tiles);
    status = checkGameStatus(shuffledTiles);
    tiles = shuffledTiles;

    if (status === "playing" || getActiveTiles(shuffledTiles).length === 0) {
      break;
    }
  }

  return {
    ...state,
    tiles,
    selectedTileId: null,
    hintPair: status === "playing" ? getHintPair(tiles) : null,
    status,
  };
}

export function createInitialBoardState(): BoardState {
  let attempt = 0;
  let tiles = generateBoard(`zen-mahjong-classic-board-${attempt}`);
  let status = checkGameStatus(tiles);

  for (attempt = 1; attempt < 30 && status === "no-moves"; attempt += 1) {
    tiles = generateBoard(`zen-mahjong-classic-board-${attempt}`);
    status = checkGameStatus(tiles);
  }

  assertClassicTurtleCentralStackAvailability(tiles);

  return {
    tiles,
    selectedTileId: null,
    hintPair: status === "playing" ? getHintPair(tiles) : null,
    removedPairs: [],
    status,
  };
}

function assertClassicTurtleCentralStackAvailability(tiles: readonly MahjongTileModel[]) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const activeTiles = getActiveTiles(tiles);
  const highestZ = Math.max(...activeTiles.map((tile) => tile.z));
  const topCenterTile = activeTiles
    .filter((tile) => tile.z === highestZ)
    .sort((first, second) => {
      const firstDistance = Math.abs(first.x - 6.5) + Math.abs(first.y - 3.5);
      const secondDistance = Math.abs(second.x - 6.5) + Math.abs(second.y - 3.5);
      return firstDistance - secondDistance;
    })[0];

  if (!topCenterTile) {
    throw new Error("Classic turtle validation failed: top center tile is missing.");
  }

  if (!isTileFree(topCenterTile, tiles)) {
    throw new Error(`Classic turtle validation failed: top center tile ${topCenterTile.id} should be free.`);
  }

  const coveredLowerTiles = activeTiles.filter(
    (tile) => tile.z < topCenterTile.z && tilesOverlap2D(tile.coord, topCenterTile.coord),
  );
  const freeCoveredLowerTiles = coveredLowerTiles.filter((tile) => isTileFree(tile, tiles));

  if (coveredLowerTiles.length < 4 || freeCoveredLowerTiles.length > 0) {
    throw new Error("Classic turtle validation failed: covered center lower tiles should remain blocked.");
  }
}

function shuffleActiveTileFaces(tiles: readonly MahjongTileModel[]) {
  const activeTiles = getActiveTiles(tiles);
  const shuffledFaces = shuffleList(
    activeTiles.map(({ type, family, rank, label, symbol, imageSrc }) => ({
      type,
      family,
      rank,
      label,
      symbol,
      imageSrc,
    })),
  );
  let faceIndex = 0;

  return tiles.map((tile) => {
    if (tile.removed) {
      return tile;
    }

    const face = shuffledFaces[faceIndex];
    faceIndex += 1;

    return { ...tile, ...face };
  });
}
