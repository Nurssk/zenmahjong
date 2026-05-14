import type { TutorialState, TutorialStep, TutorialTile } from "@/src/lib/tutorial/tutorial-types";

const CORRECT_PAIR_MESSAGE = "Отлично! Пара убрана.";
const WRONG_PAIR_MESSAGE = "Эти плитки не совпадают. Попробуйте ещё раз.";
const SAME_TILES_MESSAGE = "Можно убрать только одинаковые плитки.";
const BLOCKED_TILE_MESSAGE = "Эта плитка заблокирована. У неё закрыты обе стороны.";
const UNAVAILABLE_TILE_MESSAGE = "Эта плитка пока недоступна. Освободите её сбоку или сверху.";

export function createTutorialState(step: TutorialStep): TutorialState {
  return {
    tiles: step.tiles.map((tile) => ({ ...tile, removed: false, selected: false })),
    selectedTileId: null,
    highlightedTileIds: step.tiles.filter((tile) => tile.highlighted).map((tile) => tile.id),
    message: step.airoMessage,
    messageType: "neutral",
    history: [],
    score: 0,
    completed: false,
  };
}

export function isTutorialTileFree(tile: TutorialTile, tiles: TutorialTile[]) {
  if (tile.removed || tile.locked) {
    return false;
  }

  const visibleTiles = tiles.filter((candidate) => !candidate.removed && candidate.id !== tile.id);
  const hasTileAbove = visibleTiles.some((candidate) => candidate.z > tile.z && candidate.x === tile.x && candidate.y === tile.y);

  if (hasTileAbove) {
    return false;
  }

  const hasLeftBlocker = visibleTiles.some((candidate) => candidate.z === tile.z && candidate.y === tile.y && candidate.x === tile.x - 1);
  const hasRightBlocker = visibleTiles.some((candidate) => candidate.z === tile.z && candidate.y === tile.y && candidate.x === tile.x + 1);

  return !hasLeftBlocker || !hasRightBlocker;
}

export function areTutorialTilesMatching(first: TutorialTile, second: TutorialTile) {
  return first.type === second.type;
}

export function selectTutorialTile(state: TutorialState, step: TutorialStep, tileId: string): TutorialState {
  if (state.completed && step.id !== "mini_challenge") {
    return state;
  }

  const tile = state.tiles.find((candidate) => candidate.id === tileId);

  if (!tile || tile.removed) {
    return state;
  }

  if (!isTutorialTileFree(tile, state.tiles)) {
    return {
      ...state,
      message: step.errorMessage ?? (tile.locked ? BLOCKED_TILE_MESSAGE : UNAVAILABLE_TILE_MESSAGE),
      messageType: "warning",
      tiles: state.tiles.map((candidate) => ({ ...candidate, selected: false })),
      selectedTileId: null,
    };
  }

  if (!state.selectedTileId) {
    return selectSingleTile(state, tile.id, "Выберите вторую такую же свободную плитку.");
  }

  if (state.selectedTileId === tile.id) {
    return selectSingleTile(state, null, step.instruction);
  }

  const firstTile = state.tiles.find((candidate) => candidate.id === state.selectedTileId);

  if (!firstTile || firstTile.removed) {
    return selectSingleTile(state, tile.id, "Выберите вторую такую же свободную плитку.");
  }

  if (!areTutorialTilesMatching(firstTile, tile)) {
    return {
      ...state,
      message: step.errorMessage ?? (step.id === "same_tiles" ? SAME_TILES_MESSAGE : WRONG_PAIR_MESSAGE),
      messageType: "warning",
      selectedTileId: null,
      tiles: state.tiles.map((candidate) => ({ ...candidate, selected: false })),
    };
  }

  const nextTiles = state.tiles.map((candidate) =>
    candidate.id === firstTile.id || candidate.id === tile.id
      ? { ...candidate, removed: true, selected: false, highlighted: false }
      : { ...candidate, selected: false },
  );
  const nextState: TutorialState = {
    ...state,
    tiles: nextTiles,
    selectedTileId: null,
    highlightedTileIds: [],
    history: [...state.history, { first: firstTile, second: tile }],
    score: state.score + 100,
    message: step.successMessage ?? CORRECT_PAIR_MESSAGE,
    messageType: "success",
    completed: isStepComplete(step, nextTiles),
  };

  if (nextState.completed && step.id === "mini_challenge") {
    return {
      ...nextState,
      message: step.successMessage ?? "Вы освоили основные правила Zen Mahjong.",
      messageType: "success",
    };
  }

  return nextState;
}

export function getTutorialHint(state: TutorialState) {
  const visibleTiles = state.tiles.filter((tile) => !tile.removed && isTutorialTileFree(tile, state.tiles));

  for (let firstIndex = 0; firstIndex < visibleTiles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < visibleTiles.length; secondIndex += 1) {
      if (areTutorialTilesMatching(visibleTiles[firstIndex], visibleTiles[secondIndex])) {
        return [visibleTiles[firstIndex].id, visibleTiles[secondIndex].id];
      }
    }
  }

  return [];
}

export function applyTutorialHint(state: TutorialState, step?: TutorialStep): TutorialState {
  const highlightedTileIds = getTutorialHint(state);

  if (highlightedTileIds.length === 0) {
    return {
      ...state,
      message: "Сейчас нет доступной пары. Вернитесь на шаг назад и попробуйте другой ход.",
      messageType: "warning",
    };
  }

  return {
    ...state,
    highlightedTileIds,
    message: step?.successMessage ?? "Подсказка подсветила доступную пару. В обычной игре подсказки ограничены.",
    messageType: "success",
    completed: true,
  };
}

export function undoTutorialMove(state: TutorialState, step?: TutorialStep): TutorialState {
  const lastMove = state.history.at(-1);

  if (!lastMove) {
    return {
      ...state,
      message: step?.errorMessage ?? "Пока нечего отменять. Сначала уберите пару.",
      messageType: "warning",
    };
  }

  const restoredIds = new Set([lastMove.first.id, lastMove.second.id]);

  return {
    ...state,
    tiles: state.tiles.map((tile) =>
      restoredIds.has(tile.id)
        ? { ...tile, removed: false, selected: false }
        : { ...tile, selected: false },
    ),
    selectedTileId: null,
    highlightedTileIds: [],
    history: state.history.slice(0, -1),
    score: Math.max(0, state.score - 100),
    message: step?.successMessage ?? "Отмена вернула последний ход. В обычной игре отмены ограничены.",
    messageType: "success",
    completed: true,
  };
}

export function getVisibleTutorialTiles(tiles: TutorialTile[]) {
  return tiles.filter((tile) => !tile.removed).sort((first, second) => first.z - second.z || first.y - second.y || first.x - second.x);
}

function selectSingleTile(state: TutorialState, tileId: string | null, message: string): TutorialState {
  return {
    ...state,
    message,
    messageType: "neutral",
    selectedTileId: tileId,
    tiles: state.tiles.map((candidate) => ({ ...candidate, selected: candidate.id === tileId })),
  };
}

function isStepComplete(step: TutorialStep, tiles: TutorialTile[]) {
  if (step.id === "hint" || step.id === "undo") {
    return false;
  }

  if (step.id === "two_layers" || step.goal === "clear_board") {
    return tiles.every((tile) => tile.removed);
  }

  return tiles.some((tile) => tile.removed);
}

export const tutorialFeedback = {
  blocked: BLOCKED_TILE_MESSAGE,
  correctPair: CORRECT_PAIR_MESSAGE,
  completed: "Вы освоили основные правила Zen Mahjong.",
  wrongPair: WRONG_PAIR_MESSAGE,
};
