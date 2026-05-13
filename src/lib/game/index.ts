export {
  canRemovePair,
  checkGameStatus,
  createInitialBoardState,
  findAvailablePairs,
  generateBoard,
  getHintPair,
  isTileFree,
  removePair,
  selectTile,
  shuffleRemainingTiles,
} from "@/src/lib/game/engine";
export { CLASSIC_TURTLE_COORDINATES, isCoordinateFree } from "@/src/lib/game/coordinates";
export type {
  BoardState,
  GameMove,
  GameStatus,
  MahjongTileModel,
  TileCoordinate,
  TileFace,
  TileFamily,
} from "@/src/lib/game/types";
