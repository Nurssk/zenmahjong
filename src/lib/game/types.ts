export type TileCoordinate = readonly [x: number, y: number, z: number];

export type TileFamily =
  | "dots"
  | "bamboo"
  | "character"
  | "wind"
  | "dragon"
  | "flower"
  | "season";

export type GameStatus = "playing" | "won" | "no-moves";

export type TileFace = {
  type: string;
  family: TileFamily;
  rank: number;
  label: string;
  symbol: string;
  imageSrc?: string;
};

export type MahjongTileModel = TileFace & {
  id: string;
  coord: TileCoordinate;
  x: number;
  y: number;
  z: number;
  removed: boolean;
};

export type GameMove = {
  firstId: string;
  secondId: string;
};

export type BoardState = {
  tiles: MahjongTileModel[];
  selectedTileId: string | null;
  hintPair: GameMove | null;
  removedPairs: GameMove[];
  status: GameStatus;
};
