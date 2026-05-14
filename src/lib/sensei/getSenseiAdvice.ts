import { findAvailableMoves, isTileFree } from "@/src/lib/game";
import type { GameStatus, MahjongTileModel } from "@/src/lib/game";

export type SenseiAdvice = {
  title: string;
  message: string;
  type: "strategy" | "warning" | "hint" | "focus";
};

export type SenseiGameState = {
  tiles: readonly MahjongTileModel[];
  status?: GameStatus;
  hintCount?: number;
  combo?: number;
};

const fallbackAdvice: SenseiAdvice = {
  title: "Совет Сенсея",
  message: "Начни с верхних и крайних плиток. Они чаще всего открывают новые ходы.",
  type: "strategy",
};

export function getSenseiAdvice(gameState: SenseiGameState, adviceIndex = 0): SenseiAdvice {
  const activeTiles = gameState.tiles.filter((tile) => !tile.removed);

  if (activeTiles.length === 0) {
    return {
      title: "Поле очищено",
      message: "Ты уже разобрал расклад. Сохрани этот ритм для следующей партии.",
      type: "focus",
    };
  }

  const availablePairs = findAvailableMoves(gameState.tiles);
  const freeTilesCount = activeTiles.reduce((count, tile) => count + (isTileFree(tile, gameState.tiles) ? 1 : 0), 0);
  const blockedRatio = activeTiles.length > 0 ? 1 - freeTilesCount / activeTiles.length : 0;
  const advice: SenseiAdvice[] = [];

  if (gameState.status === "lost" || availablePairs.length === 0) {
    advice.push({
      title: "Ходов не осталось",
      message: "Расклад зашёл в тупик. В следующей партии чаще освобождай края и верхние слои, чтобы не закрывать центр.",
      type: "warning",
    });
  }

  if ((gameState.hintCount ?? 0) <= 0) {
    advice.push({
      title: "Играй внимательнее",
      message: "Подсказки закончились. Ищи одинаковые свободные плитки по краям и не трать ход, если пара не открывает новые варианты.",
      type: "hint",
    });
  }

  if ((gameState.combo ?? 1) >= 3) {
    advice.push({
      title: "Хороший темп",
      message: "Ты держишь сильное комбо. Продолжай открывать пары без долгих пауз, но не жертвуй позицией ради скорости.",
      type: "focus",
    });
  }

  if (availablePairs.length > 0 && availablePairs.length <= 3) {
    advice.push({
      title: "Мало ходов",
      message: "Осталось мало вариантов. Не спеши: выбери пару, которая открывает центральную часть раскладки или верхний слой.",
      type: "warning",
    });
  }

  if (blockedRatio > 0.68) {
    advice.push({
      title: "Много блокировок",
      message: "Много плиток заблокировано. Лучше освобождать края и верхние слои, чтобы открыть новые варианты.",
      type: "strategy",
    });
  }

  if (availablePairs.length > 0) {
    advice.push({
      title: "Открывай пространство",
      message: "Найди пару среди свободных плиток. Сначала убирай пары, которые открывают больше закрытых плиток.",
      type: "strategy",
    });
  }

  advice.push(fallbackAdvice);

  return advice[Math.abs(adviceIndex) % advice.length] ?? fallbackAdvice;
}
