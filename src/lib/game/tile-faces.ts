import type { TileFace, TileFamily } from "@/src/lib/game/types";

const suitSymbols: Record<TileFamily, string[]> = {
  dots: ["一", "二", "三", "四", "五", "六", "七", "八", "九"],
  bamboo: ["竹1", "竹2", "竹3", "竹4", "竹5", "竹6", "竹7", "竹8", "竹9"],
  character: ["萬1", "萬2", "萬3", "萬4", "萬5", "萬6", "萬7", "萬8", "萬9"],
  wind: ["東", "南", "西", "北"],
  dragon: ["中", "發", "白"],
  flower: ["梅", "蘭", "菊", "竹"],
  season: ["春", "夏", "秋", "冬"],
};

const tileGroups: Array<{ family: TileFamily; count: number; multiplicity: number; label: string }> = [
  { family: "dots", count: 9, multiplicity: 4, label: "Круги" },
  { family: "bamboo", count: 9, multiplicity: 4, label: "Бамбук" },
  { family: "character", count: 9, multiplicity: 4, label: "Символы" },
  { family: "wind", count: 4, multiplicity: 4, label: "Ветер" },
  { family: "dragon", count: 3, multiplicity: 4, label: "Дракон" },
  { family: "flower", count: 4, multiplicity: 1, label: "Цветы" },
  { family: "season", count: 4, multiplicity: 1, label: "Сезоны" },
];

const availableTileAssets = new Set([
  ...Array.from({ length: 9 }, (_, index) => `bamboo${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `character${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `dots${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `wind${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `dragon${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `flower${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `season${index + 1}`),
]);

function getImageSrc(family: TileFamily, rank: number) {
  // The uploaded asset pack uses dots1-dots9 for circle tiles; no circle*.png files are present.
  const assetKey = `${family}${rank}`;

  return availableTileAssets.has(assetKey) ? `/tiles/default/${assetKey}.png` : undefined;
}

export function createTileFaces(): TileFace[] {
  return tileGroups.flatMap(({ family, count, multiplicity, label }) =>
    Array.from({ length: count }, (_, rankIndex) => {
      const rank = rankIndex + 1;
      const type = multiplicity > 1 ? `${family}-${rank}` : family;

      return Array.from({ length: multiplicity }, (): TileFace => ({
        type,
        family,
        rank,
        label: `${label} ${rank}`,
        symbol: suitSymbols[family][rankIndex],
        imageSrc: getImageSrc(family, rank),
      }));
    }).flat(),
  );
}
