import type { Tile } from "@/types";

const tileTypes = ["bamboo", "coin", "dragon", "flower", "wind", "season"];

export function generateDemoBoard(): Tile[] {
  return Array.from({ length: 42 }, (_, index) => ({
    id: `tile-${index}`,
    type: tileTypes[index % tileTypes.length],
    x: index % 10,
    y: Math.floor(index / 10),
    z: index % 3 === 0 ? 1 : 0,
    removed: false,
  }));
}
