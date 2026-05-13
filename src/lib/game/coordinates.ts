import { coordinateKey, interval, matrixInterval } from "@/src/lib/game/utils";
import type { TileCoordinate } from "@/src/lib/game/types";

const TILE_COORD_WIDTH = 1;
const TILE_COORD_HEIGHT = 1;
const TOUCH_EPSILON = 0.001;

const makeCoord = (x: number, y: number, z: number): TileCoordinate => [x, y, z];

const level0: TileCoordinate[] = [
  ...interval(1, 12, (x): TileCoordinate => [x, 0, 0]),
  ...interval(3, 10, (x): TileCoordinate => [x, 1, 0]),
  ...interval(2, 11, (x): TileCoordinate => [x, 2, 0]),
  makeCoord(0, 3.5, 0),
  ...interval(1, 12, (x): TileCoordinate => [x, 3, 0]),
  ...interval(1, 12, (x): TileCoordinate => [x, 4, 0]),
  makeCoord(13, 3.5, 0),
  makeCoord(14, 3.5, 0),
  ...interval(2, 11, (x): TileCoordinate => [x, 5, 0]),
  ...interval(3, 10, (x): TileCoordinate => [x, 6, 0]),
  ...interval(1, 12, (x): TileCoordinate => [x, 7, 0]),
].reverse();

const level1 = matrixInterval(4, 9, 1, 6, (x, y): TileCoordinate => [x, y, 1]).reverse();
const level2 = matrixInterval(5, 8, 2, 5, (x, y): TileCoordinate => [x, y, 2]).reverse();
const level3 = matrixInterval(6, 7, 3, 4, (x, y): TileCoordinate => [x, y, 3]).reverse();
const level4: TileCoordinate[] = [makeCoord(6.5, 3.5, 4)];

export const CLASSIC_TURTLE_COORDINATES: TileCoordinate[] = [
  ...level0,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
];

function hasAnyCoord(coords: readonly TileCoordinate[], search: readonly TileCoordinate[]) {
  const activeKeys = new Set(coords.map(coordinateKey));
  return search.some((coord) => activeKeys.has(coordinateKey(coord)));
}

function overlaps1D(firstStart: number, firstEnd: number, secondStart: number, secondEnd: number) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

function touches(firstEnd: number, secondStart: number) {
  return Math.abs(firstEnd - secondStart) < TOUCH_EPSILON;
}

export function tilesOverlap2D(first: TileCoordinate, second: TileCoordinate) {
  const [firstX, firstY] = first;
  const [secondX, secondY] = second;

  return (
    overlaps1D(firstX, firstX + TILE_COORD_WIDTH, secondX, secondX + TILE_COORD_WIDTH) &&
    overlaps1D(firstY, firstY + TILE_COORD_HEIGHT, secondY, secondY + TILE_COORD_HEIGHT)
  );
}

function overlapsVertically(first: TileCoordinate, second: TileCoordinate) {
  const [, firstY] = first;
  const [, secondY] = second;

  return overlaps1D(firstY, firstY + TILE_COORD_HEIGHT, secondY, secondY + TILE_COORD_HEIGHT);
}

function isCoveredByTileAbove(coord: TileCoordinate, activeCoords: readonly TileCoordinate[]) {
  const [, , z] = coord;

  return activeCoords.some((other) => other[2] > z && tilesOverlap2D(coord, other));
}

function hasLeftBlocker(coord: TileCoordinate, activeCoords: readonly TileCoordinate[]) {
  const [x, , z] = coord;

  return activeCoords.some(
    (other) =>
      other[2] === z &&
      !hasAnyCoord([other], [coord]) &&
      overlapsVertically(coord, other) &&
      touches(other[0] + TILE_COORD_WIDTH, x),
  );
}

function hasRightBlocker(coord: TileCoordinate, activeCoords: readonly TileCoordinate[]) {
  const [x, , z] = coord;

  return activeCoords.some(
    (other) =>
      other[2] === z &&
      !hasAnyCoord([other], [coord]) &&
      overlapsVertically(coord, other) &&
      touches(x + TILE_COORD_WIDTH, other[0]),
  );
}

export function getCoordinateAvailability(coord: TileCoordinate, activeCoords: readonly TileCoordinate[]) {
  const exists = hasAnyCoord(activeCoords, [coord]);
  const coveredByAbove = exists ? isCoveredByTileAbove(coord, activeCoords) : false;
  const leftBlocked = exists ? hasLeftBlocker(coord, activeCoords) : false;
  const rightBlocked = exists ? hasRightBlocker(coord, activeCoords) : false;

  return {
    exists,
    coveredByAbove,
    leftBlocked,
    rightBlocked,
    isFree: exists && !coveredByAbove && (!leftBlocked || !rightBlocked),
  };
}

export function isCoordinateFree(coord: TileCoordinate, activeCoords: readonly TileCoordinate[]) {
  return getCoordinateAvailability(coord, activeCoords).isFree;
}
