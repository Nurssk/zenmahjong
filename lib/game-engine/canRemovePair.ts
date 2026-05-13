import type { Tile } from "@/types";

export function canRemovePair(first: Tile, second: Tile) {
  return first.id !== second.id && first.type === second.type;
}
