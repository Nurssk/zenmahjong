import type { TileCoordinate } from "@/src/lib/game/types";

export function interval<T>(start: number, end: number, mapper: (value: number) => T) {
  return Array.from({ length: end - start + 1 }, (_, index) => mapper(start + index));
}

export function matrixInterval<T>(
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  mapper: (x: number, y: number) => T,
) {
  return interval(startY, endY, (y) => interval(startX, endX, (x) => mapper(x, y))).flat();
}

export function coordinateKey(coord: TileCoordinate) {
  return coord.join(":");
}

export function sameCoordinate(first: TileCoordinate, second: TileCoordinate) {
  return coordinateKey(first) === coordinateKey(second);
}

export function shuffleList<T>(list: readonly T[]) {
  const next = [...list];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }

  return next;
}

export function shuffleListWithSeed<T>(list: readonly T[], seed: string) {
  const next = [...list];
  const random = createSeededRandom(seed);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }

  return next;
}

function createSeededRandom(seed: string) {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
