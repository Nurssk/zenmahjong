"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Clock3,
  Home,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Star,
  Trophy,
} from "lucide-react";
import { GameActionButton } from "@/components/game/game-action-button";
import { MahjongTile } from "@/components/game/mahjong-tile";
import { useToast } from "@/components/ui/use-toast";
import { demoInventory } from "@/constants/product";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { playSound } from "@/src/lib/audio";
import { AUDIO_ASSETS } from "@/src/lib/audio/audio-assets";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCompletedGame,
  saveCurrentGame,
  type CurrentGameSave,
  type CurrentGameSaveInput,
  type SavedGameDifficulty,
  type SavedGameMove,
} from "@/src/lib/game-save";
import {
  checkGameStatus,
  createInitialBoardState,
  findAvailableMoves,
  getHintPair,
  isTileFree,
  selectTile,
  shuffleRemainingTiles,
} from "@/src/lib/game";
import type { BoardState, MahjongTileModel } from "@/src/lib/game";

const TILE_WIDTH = 56;
const TILE_HEIGHT = 80;
const TILE_DEPTH = 7;
const OFFSET_LEFT = 80;
const OFFSET_TOP = 30;
const BOARD_WIDTH = 940;
const BOARD_HEIGHT = 690;
const BASE_PAIR_SCORE = 50;
const COMBO_WINDOW_SECONDS = 5;
const TILE_EXIT_ANIMATION_MS = 260;
const MAX_SHUFFLES = demoInventory.shuffle;

export type Difficulty = "easy" | "medium" | "hard";
type ScoredMove = SavedGameMove & Required<Pick<SavedGameMove, "pointsEarned" | "comboAtMove" | "timestamp">>;
type ScoreState = {
  score: number;
  combo: number;
  lastMatchSecond: number | null;
  history: ScoredMove[];
};

export type GameWinStats = {
  score: number;
  elapsedSeconds: number;
  movesCount: number;
  hintsUsed: number;
  shufflesUsed: number;
};

export type GameLostStats = GameWinStats;

export type MahjongBoardSnapshotReason = "match" | "shuffle" | "interval" | "terminal" | "manual";

export type MahjongBoardProgressSnapshot = {
  layoutId: string;
  difficulty: Difficulty;
  tiles: MahjongTileModel[];
  removedTileIds: string[];
  selectedTileId: string | null;
  score: number;
  comboMultiplier: number;
  elapsedSeconds: number;
  movesCount: number;
  hintsUsed: number;
  shufflesUsed: number;
  completed: boolean;
  lost: boolean;
};

const difficulties: Array<{ id: Difficulty; label: string }> = [
  { id: "easy", label: "Лёгкий" },
  { id: "medium", label: "Средний" },
  { id: "hard", label: "Сложный" },
];

function getTileStyle(tile: MahjongTileModel) {
  return {
    left: `${((tile.x * TILE_WIDTH + tile.z * TILE_DEPTH + OFFSET_LEFT) / BOARD_WIDTH) * 100}%`,
    top: `${((tile.y * TILE_HEIGHT + tile.z * TILE_DEPTH + OFFSET_TOP) / BOARD_HEIGHT) * 100}%`,
    width: `${(TILE_WIDTH / BOARD_WIDTH) * 100}%`,
    zIndex: tile.z * 20 + Math.round(tile.y * 2),
  };
}

function isTileVisuallyCoveredByCenterTop(tile: MahjongTileModel, tiles: readonly MahjongTileModel[]) {
  if (tile.removed || tile.z !== 3) {
    return false;
  }

  return tiles.some(
    (other) =>
      !other.removed &&
      other.id !== tile.id &&
      other.z === 4 &&
      Math.abs(other.x - tile.x) < 2 &&
      Math.abs(other.y - tile.y) < 2,
  );
}

function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function createInitialScoreState(): ScoreState {
  return {
    score: 0,
    combo: 1,
    lastMatchSecond: null,
    history: [],
  };
}

function createBoardStateFromSave(save: CurrentGameSave) {
  const removedTileIds = new Set(save.removedTileIds);
  const tiles = save.tiles.map((tile) => ({
    ...tile,
    removed: tile.removed || removedTileIds.has(tile.id),
  }));
  const status = checkGameStatus(tiles);

  return {
    tiles,
    selectedTileId: save.selectedTileId && !removedTileIds.has(save.selectedTileId) ? save.selectedTileId : null,
    hintPair: status === "playing" ? getHintPair(tiles) : null,
    removedPairs: save.undoStack.map(({ firstId, secondId }) => ({ firstId, secondId })),
    status,
  };
}

function createBoardStateFromTiles(tiles: readonly MahjongTileModel[]): BoardState {
  const normalizedTiles = tiles.map((tile) => ({ ...tile, removed: false }));
  const status = checkGameStatus(normalizedTiles);

  return {
    tiles: normalizedTiles,
    selectedTileId: null,
    hintPair: status === "playing" ? getHintPair(normalizedTiles) : null,
    removedPairs: [],
    status,
  };
}

function createRemovedPairsFromIds(removedTileIds: readonly string[]): ScoredMove[] {
  const pairs: ScoredMove[] = [];

  for (let index = 0; index < removedTileIds.length - 1; index += 2) {
    pairs.push({
      firstId: removedTileIds[index],
      secondId: removedTileIds[index + 1],
      pointsEarned: BASE_PAIR_SCORE,
      comboAtMove: 1,
      timestamp: 0,
    });
  }

  return pairs;
}

function createBoardStateFromSnapshot(snapshot: MahjongBoardProgressSnapshot): BoardState {
  const removedTileIds = new Set(snapshot.removedTileIds);
  const tiles = snapshot.tiles.map((tile) => ({
    ...tile,
    removed: tile.removed || removedTileIds.has(tile.id),
  }));
  const activeTiles = tiles.filter((tile) => !tile.removed);
  const status = snapshot.completed ? "won" : snapshot.lost ? "lost" : checkGameStatus(tiles);
  const selectedTileId =
    snapshot.selectedTileId && !removedTileIds.has(snapshot.selectedTileId) ? snapshot.selectedTileId : null;

  return {
    tiles,
    selectedTileId: status === "playing" ? selectedTileId : null,
    hintPair: status === "playing" && activeTiles.length > 0 ? getHintPair(tiles) : null,
    removedPairs: createRemovedPairsFromIds(snapshot.removedTileIds).map(({ firstId, secondId }) => ({
      firstId,
      secondId,
    })),
    status,
  };
}

function createScoreStateFromSnapshot(snapshot: MahjongBoardProgressSnapshot): ScoreState {
  return {
    score: snapshot.score,
    combo: Math.max(1, snapshot.comboMultiplier),
    lastMatchSecond: null,
    history: createRemovedPairsFromIds(snapshot.removedTileIds),
  };
}

function normalizeSavedMoves(moves: SavedGameMove[]): ScoredMove[] {
  return moves.map((move) => ({
    firstId: move.firstId,
    secondId: move.secondId,
    pointsEarned: move.pointsEarned ?? BASE_PAIR_SCORE,
    comboAtMove: move.comboAtMove ?? 1,
    timestamp: move.timestamp ?? 0,
  }));
}

function formatGameTime(seconds: number) {
  return formatElapsedTime(Math.max(0, seconds));
}

export function MahjongBoard({
  compact = false,
  initialTiles,
  initialSnapshot,
  initialStateKey,
  lockedDifficulty,
  hintsEnabled = true,
  undoEnabled = true,
  onGameWon,
  onGameLost,
  onProgressSnapshot,
  persistGame = false,
  restartEnabled = true,
  showDifficultySelector = true,
}: {
  compact?: boolean;
  initialTiles?: readonly MahjongTileModel[];
  initialSnapshot?: MahjongBoardProgressSnapshot | null;
  initialStateKey?: string;
  lockedDifficulty?: Difficulty;
  hintsEnabled?: boolean;
  undoEnabled?: boolean;
  onGameWon?: (stats: GameWinStats) => void;
  onGameLost?: (stats: GameLostStats) => void;
  onProgressSnapshot?: (snapshot: MahjongBoardProgressSnapshot, reason: MahjongBoardSnapshotReason) => void;
  persistGame?: boolean;
  restartEnabled?: boolean;
  showDifficultySelector?: boolean;
}) {
  const gameShellRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const latestSaveRef = useRef<CurrentGameSaveInput | null>(null);
  const saveWarningShownRef = useRef(false);
  const completedSavedRef = useRef(false);
  const winNotifiedRef = useRef(false);
  const lostNotifiedRef = useRef(false);
  const terminalSnapshotEmittedRef = useRef(false);
  const resultSoundPlayedRef = useRef(false);
  const latestProgressSnapshotRef = useRef<MahjongBoardProgressSnapshot | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const initialDifficulty = lockedDifficulty ?? initialSnapshot?.difficulty ?? "easy";
  const createFreshBoardState = useCallback(() => {
    if (initialSnapshot && !restartEnabled) {
      return createBoardStateFromSnapshot(initialSnapshot);
    }

    return initialTiles ? createBoardStateFromTiles(initialTiles) : createInitialBoardState();
  }, [initialSnapshot, initialTiles, restartEnabled]);
  const [state, setState] = useState<BoardState>(() =>
    initialSnapshot
      ? createBoardStateFromSnapshot(initialSnapshot)
      : initialTiles
        ? createBoardStateFromTiles(initialTiles)
        : createInitialBoardState(),
  );
  const [highlightedHint, setHighlightedHint] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [coachOpen, setCoachOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(persistGame);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSnapshot?.elapsedSeconds ?? 0);
  const [hintsUsed, setHintsUsed] = useState(initialSnapshot?.hintsUsed ?? 0);
  const [pendingSave, setPendingSave] = useState<CurrentGameSave | null>(null);
  const [saveChecked, setSaveChecked] = useState(!persistGame);
  const [shufflesUsed, setShufflesUsed] = useState(initialSnapshot?.shufflesUsed ?? 0);
  const [noMovesModalVisible, setNoMovesModalVisible] = useState(false);
  const { soundEnabled } = useSoundPreference();
  const [scoreState, setScoreState] = useState<ScoreState>(() =>
    initialSnapshot ? createScoreStateFromSnapshot(initialSnapshot) : createInitialScoreState(),
  );
  const {
    pauseMusic,
    playChooseSound,
    playMatchSound,
    resumeMusic,
    setMuted: setAudioMuted,
    startMusic,
  } = useSiteAudio();

  const activeTiles = useMemo(() => state.tiles.filter((tile) => !tile.removed), [state.tiles]);
  const availableMoves = useMemo(() => findAvailableMoves(state.tiles), [state.tiles]);
  const removedCount = state.tiles.length - activeTiles.length;
  const progress = Math.round((removedCount / Math.max(1, state.tiles.length)) * 100);
  const canUndo = undoEnabled && state.removedPairs.length > 0;
  const interactionsLocked = isPaused || state.status !== "playing" || Boolean(pendingSave) || !saveChecked;
  const canShuffle = state.status === "lost" && activeTiles.length > 0 && shufflesUsed < MAX_SHUFFLES;
  const terminalLost = state.status === "lost" && activeTiles.length > 0 && !canShuffle;
  const comboRemainingSeconds =
    scoreState.lastMatchSecond === null
      ? 0
      : Math.max(0, COMBO_WINDOW_SECONDS - (elapsedSeconds - scoreState.lastMatchSecond));
  const comboProgress = scoreState.lastMatchSecond === null ? 0 : (comboRemainingSeconds / COMBO_WINDOW_SECONDS) * 100;
  const userId = persistGame ? user?.uid : undefined;

  const showSaveWarning = useCallback(() => {
    if (saveWarningShownRef.current) {
      return;
    }

    saveWarningShownRef.current = true;
    toast({
      title: "Сохранение недоступно",
      description: "Игра продолжается локально. Прогресс синхронизируется, когда Firestore станет доступен.",
      variant: "destructive",
    });
  }, [toast]);

  const createSaveInput = useCallback(
    (
      nextState: BoardState = state,
      nextScoreState: ScoreState = scoreState,
      overrides?: {
        difficulty?: Difficulty;
        elapsedSeconds?: number;
        hintsUsed?: number;
        isPaused?: boolean;
      },
    ): CurrentGameSaveInput => ({
      layoutId: "classic-turtle",
      difficulty: (overrides?.difficulty ?? lockedDifficulty ?? difficulty) as SavedGameDifficulty,
      tiles: nextState.tiles,
      removedTileIds: nextState.tiles.filter((tile) => tile.removed).map((tile) => tile.id),
      selectedTileId: nextState.selectedTileId,
      score: nextScoreState.score,
      comboMultiplier: nextScoreState.combo,
      elapsedSeconds: overrides?.elapsedSeconds ?? elapsedSeconds,
      moves: nextScoreState.history,
      undoStack: nextScoreState.history,
      hintsUsed: overrides?.hintsUsed ?? hintsUsed,
      shufflesUsed,
      isPaused: overrides?.isPaused ?? isPaused,
    }),
    [difficulty, elapsedSeconds, hintsUsed, isPaused, lockedDifficulty, scoreState, shufflesUsed, state],
  );

  const createProgressSnapshot = useCallback(
    (
      nextState: BoardState = state,
      nextScoreState: ScoreState = scoreState,
      overrides?: {
        difficulty?: Difficulty;
        elapsedSeconds?: number;
        hintsUsed?: number;
        shufflesUsed?: number;
      },
    ): MahjongBoardProgressSnapshot => {
      const nextShufflesUsed = overrides?.shufflesUsed ?? shufflesUsed;
      const nextActiveTiles = nextState.tiles.filter((tile) => !tile.removed);
      const nextCanShuffle = nextState.status === "lost" && nextActiveTiles.length > 0 && nextShufflesUsed < MAX_SHUFFLES;

      return {
        layoutId: "daily-tournament",
        difficulty: overrides?.difficulty ?? lockedDifficulty ?? difficulty,
        tiles: nextState.tiles,
        removedTileIds: nextState.tiles.filter((tile) => tile.removed).map((tile) => tile.id),
        selectedTileId: nextState.selectedTileId,
        score: nextScoreState.score,
        comboMultiplier: nextScoreState.combo,
        elapsedSeconds: overrides?.elapsedSeconds ?? elapsedSeconds,
        movesCount: nextState.removedPairs.length,
        hintsUsed: overrides?.hintsUsed ?? hintsUsed,
        shufflesUsed: nextShufflesUsed,
        completed: nextState.status === "won",
        lost: nextState.status === "lost" && nextActiveTiles.length > 0 && !nextCanShuffle,
      };
    },
    [difficulty, elapsedSeconds, hintsUsed, lockedDifficulty, scoreState, shufflesUsed, state],
  );

  const emitProgressSnapshot = useCallback(
    (
      reason: MahjongBoardSnapshotReason,
      nextState: BoardState = state,
      nextScoreState: ScoreState = scoreState,
      overrides?: {
        difficulty?: Difficulty;
        elapsedSeconds?: number;
        hintsUsed?: number;
        shufflesUsed?: number;
      },
    ) => {
      if (!onProgressSnapshot) {
        return;
      }

      const snapshot = createProgressSnapshot(nextState, nextScoreState, overrides);
      latestProgressSnapshotRef.current = snapshot;
      onProgressSnapshot(snapshot, reason);
    },
    [createProgressSnapshot, onProgressSnapshot, scoreState, state],
  );

  const saveSnapshot = useCallback(
    async (snapshot: CurrentGameSaveInput | null = latestSaveRef.current) => {
      if (!persistGame || !userId || !snapshot || state.status === "won" || pendingSave) {
        return;
      }

      try {
        await saveCurrentGame(userId, snapshot);
        saveWarningShownRef.current = false;
      } catch (error) {
        console.warn("Failed to save current Zen Mahjong game:", error);
        showSaveWarning();
      }
    },
    [pendingSave, persistGame, showSaveWarning, state.status, userId],
  );

  const queueSave = useCallback(
    (snapshot: CurrentGameSaveInput) => {
      latestSaveRef.current = snapshot;

      if (!persistGame || !userId || pendingSave) {
        return;
      }

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        saveTimeoutRef.current = null;
        void saveSnapshot(snapshot);
      }, 500);
    },
    [pendingSave, persistGame, saveSnapshot, userId],
  );

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === gameShellRef.current);
    }

    function handleFullscreenEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !document.fullscreenElement) {
        return;
      }

      void document.exitFullscreen().catch(() => undefined);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleFullscreenEscape);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleFullscreenEscape);
    };
  }, []);

  useEffect(() => {
    latestSaveRef.current = createSaveInput();
  }, [createSaveInput]);

  useEffect(() => {
    latestProgressSnapshotRef.current = createProgressSnapshot();
  }, [createProgressSnapshot]);

  useEffect(() => {
    if ((!initialTiles && !initialSnapshot) || persistGame) {
      return;
    }

    const nextState = initialSnapshot ? createBoardStateFromSnapshot(initialSnapshot) : createBoardStateFromTiles(initialTiles ?? []);
    const nextScoreState = initialSnapshot ? createScoreStateFromSnapshot(initialSnapshot) : createInitialScoreState();

    setHighlightedHint([]);
    setCoachOpen(false);
    setIsPaused(false);
    setNoMovesModalVisible(false);
    setElapsedSeconds(initialSnapshot?.elapsedSeconds ?? 0);
    setHintsUsed(initialSnapshot?.hintsUsed ?? 0);
    setShufflesUsed(initialSnapshot?.shufflesUsed ?? 0);
    setDifficulty(lockedDifficulty ?? initialSnapshot?.difficulty ?? "easy");
    setScoreState(nextScoreState);
    completedSavedRef.current = false;
    winNotifiedRef.current = nextState.status !== "playing";
    lostNotifiedRef.current = nextState.status !== "playing";
    terminalSnapshotEmittedRef.current = nextState.status !== "playing";
    resultSoundPlayedRef.current = nextState.status !== "playing";
    setState(nextState);
  }, [initialSnapshot, initialStateKey, initialTiles, lockedDifficulty, persistGame]);

  useEffect(() => {
    setAudioMuted(!soundEnabled);
  }, [setAudioMuted, soundEnabled]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!persistGame) {
      return undefined;
    }

    if (authLoading) {
      return undefined;
    }

    if (!userId) {
      setSaveChecked(true);
      setIsPaused(false);
      return undefined;
    }

    let cancelled = false;
    setSaveChecked(false);

    loadCurrentGame(userId)
      .then((save) => {
        if (cancelled) {
          return;
        }

        const hasUnfinishedSave = Boolean(save?.tiles.length && save.tiles.some((tile) => !tile.removed));

        if (save && hasUnfinishedSave) {
          setPendingSave(save);
          setIsPaused(true);
        } else {
          setIsPaused(false);
        }

        setSaveChecked(true);
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("Failed to load saved Zen Mahjong game:", error);
          showSaveWarning();
          setIsPaused(false);
          setSaveChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, persistGame, showSaveWarning, userId]);

  useEffect(() => {
    if (!persistGame || !userId || !saveChecked || pendingSave || isPaused || state.status !== "playing") {
      return undefined;
    }

    const saveIntervalId = window.setInterval(() => {
      void saveSnapshot();
    }, 10000);

    return () => {
      window.clearInterval(saveIntervalId);
    };
  }, [isPaused, pendingSave, persistGame, saveChecked, saveSnapshot, state.status, userId]);

  useEffect(() => {
    if (!onProgressSnapshot || !saveChecked || pendingSave || isPaused || state.status !== "playing") {
      return undefined;
    }

    const progressIntervalId = window.setInterval(() => {
      emitProgressSnapshot("interval");
    }, 10000);

    return () => {
      window.clearInterval(progressIntervalId);
    };
  }, [emitProgressSnapshot, isPaused, onProgressSnapshot, pendingSave, saveChecked, state.status]);

  useEffect(() => {
    if (!persistGame) {
      return undefined;
    }

    const handleBeforeUnload = () => {
      void saveSnapshot(latestSaveRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [persistGame, saveSnapshot]);

  useEffect(() => {
    if (!onProgressSnapshot) {
      return undefined;
    }

    const handleBeforeUnload = () => {
      const snapshot = latestProgressSnapshotRef.current;

      if (snapshot) {
        onProgressSnapshot(snapshot, "manual");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onProgressSnapshot]);

  useEffect(() => {
    if (!persistGame || !userId || state.status !== "won" || completedSavedRef.current) {
      return;
    }

    completedSavedRef.current = true;

    void (async () => {
      try {
        await saveCompletedGame(userId, {
          layoutId: "classic-turtle",
          difficulty,
          score: scoreState.score,
          elapsedSeconds,
          movesCount: state.removedPairs.length,
          hintsUsed,
          shufflesUsed,
          focusScore: Math.max(0, scoreState.score - hintsUsed * 10),
        });
        await clearCurrentGame(userId);
      } catch (error) {
        console.warn("Failed to save completed Zen Mahjong game:", error);
        showSaveWarning();
      }
    })();
  }, [
    difficulty,
    elapsedSeconds,
    hintsUsed,
    persistGame,
    scoreState.score,
    showSaveWarning,
    shufflesUsed,
    state.removedPairs.length,
    state.status,
    userId,
  ]);

  useEffect(() => {
    if (!onGameWon || state.status !== "won" || winNotifiedRef.current) {
      return;
    }

    winNotifiedRef.current = true;
    onGameWon({
      score: scoreState.score,
      elapsedSeconds,
      movesCount: state.removedPairs.length,
      hintsUsed,
      shufflesUsed,
    });
  }, [
    elapsedSeconds,
    hintsUsed,
    onGameWon,
    scoreState.score,
    shufflesUsed,
    state.removedPairs.length,
    state.status,
  ]);

  useEffect(() => {
    if (!onGameLost || !terminalLost || lostNotifiedRef.current) {
      return;
    }

    lostNotifiedRef.current = true;
    onGameLost({
      score: scoreState.score,
      elapsedSeconds,
      movesCount: state.removedPairs.length,
      hintsUsed,
      shufflesUsed,
    });
  }, [
    elapsedSeconds,
    hintsUsed,
    onGameLost,
    scoreState.score,
    shufflesUsed,
    state.removedPairs.length,
    terminalLost,
  ]);

  useEffect(() => {
    if (!onProgressSnapshot || terminalSnapshotEmittedRef.current) {
      return;
    }

    if (state.status !== "won" && !terminalLost) {
      return;
    }

    terminalSnapshotEmittedRef.current = true;
    emitProgressSnapshot("terminal");
  }, [emitProgressSnapshot, onProgressSnapshot, state.status, terminalLost]);

  useEffect(() => {
    if (isPaused || state.status !== "playing") {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isPaused, state.status]);

  useEffect(() => {
    if (scoreState.lastMatchSecond === null || elapsedSeconds - scoreState.lastMatchSecond < COMBO_WINDOW_SECONDS) {
      return;
    }

    setScoreState((current) =>
      current.lastMatchSecond === scoreState.lastMatchSecond
        ? { ...current, combo: 1, lastMatchSecond: null }
        : current,
    );
  }, [elapsedSeconds, scoreState.lastMatchSecond]);

  useEffect(() => {
    if (isPaused || state.status !== "playing") {
      pauseMusic();
      return;
    }

    resumeMusic();
  }, [isPaused, pauseMusic, resumeMusic, state.status]);

  useEffect(() => () => {
    resumeMusic();
  }, [resumeMusic]);

  useEffect(() => {
    if (pendingSave || !saveChecked || resultSoundPlayedRef.current) {
      return;
    }

    if (state.status === "won") {
      resultSoundPlayedRef.current = true;
      playSound(AUDIO_ASSETS.win, soundEnabled);
      return;
    }

    if (state.status === "lost" && activeTiles.length > 0) {
      resultSoundPlayedRef.current = true;
      playSound(AUDIO_ASSETS.lose, soundEnabled);
    }
  }, [activeTiles.length, pendingSave, saveChecked, soundEnabled, state.status]);

  useEffect(() => {
    if (state.status !== "lost" || activeTiles.length === 0 || pendingSave || !saveChecked) {
      setNoMovesModalVisible(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNoMovesModalVisible(true);
    }, TILE_EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTiles.length, pendingSave, saveChecked, state.status]);

  function handleSelect(tileId: string) {
    if (interactionsLocked) {
      return;
    }

    startMusic();
    const tile = state.tiles.find((item) => item.id === tileId);
    const free = tile ? isTileFree(tile, state.tiles) : false;

    if (!tile) {
      return;
    }

    if (!free) {
      return;
    }

    playChooseSound();
    setHighlightedHint([]);
    const nextState = selectTile(state, tileId);
    const matchedPair = nextState.removedPairs.length > state.removedPairs.length ? nextState.removedPairs.at(-1) : null;

    if (matchedPair) {
      playMatchSound();
      const matchedWithinComboWindow =
        scoreState.lastMatchSecond !== null && elapsedSeconds - scoreState.lastMatchSecond <= COMBO_WINDOW_SECONDS;
      const comboAtMove = matchedWithinComboWindow ? scoreState.combo + 1 : 1;
      const pointsEarned = BASE_PAIR_SCORE * comboAtMove;
      const nextScoreState: ScoreState = {
        score: scoreState.score + pointsEarned,
        combo: comboAtMove,
        lastMatchSecond: elapsedSeconds,
        history: [
          ...scoreState.history,
          {
            ...matchedPair,
            pointsEarned,
            comboAtMove,
            timestamp: elapsedSeconds,
          },
        ],
      };

      setScoreState(nextScoreState);
      queueSave(createSaveInput(nextState, nextScoreState));
      emitProgressSnapshot(nextState.status === "won" || nextState.status === "lost" ? "terminal" : "match", nextState, nextScoreState);
    }

    setState(nextState);
  }

  function handleHint() {
    if (interactionsLocked || !hintsEnabled) {
      return;
    }

    startMusic();
    const pair = state.hintPair ?? availableMoves[0];

    if (!pair) {
      return;
    }

    setHighlightedHint([pair.firstId, pair.secondId]);
    setHintsUsed((current) => current + 1);
    window.setTimeout(() => setHighlightedHint([]), 1800);
  }

  function handleRestart() {
    if (!restartEnabled) {
      return;
    }

    startMusic();
    setHighlightedHint([]);
    setCoachOpen(false);
    setIsPaused(false);
    setNoMovesModalVisible(false);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setShufflesUsed(0);
    setScoreState(createInitialScoreState());
    const nextState = createFreshBoardState();
    completedSavedRef.current = false;
    winNotifiedRef.current = false;
    lostNotifiedRef.current = false;
    terminalSnapshotEmittedRef.current = false;
    resultSoundPlayedRef.current = false;
    setState(nextState);

    if (userId) {
      void clearCurrentGame(userId).catch((error) => {
        console.warn("Failed to clear current Zen Mahjong save:", error);
        showSaveWarning();
      });
    }
  }

  function handleUndo() {
    if (interactionsLocked || !undoEnabled) {
      return;
    }

    startMusic();
    setHighlightedHint([]);
    const lastPair = state.removedPairs.at(-1);

    if (!lastPair) {
      return;
    }

    const tiles = state.tiles.map((tile) =>
      tile.id === lastPair.firstId || tile.id === lastPair.secondId ? { ...tile, removed: false } : tile,
    );
    const removedPairs = state.removedPairs.slice(0, -1);
    const status = checkGameStatus(tiles);

    const nextState = {
      ...state,
      tiles,
      removedPairs,
      selectedTileId: null,
      hintPair: status === "playing" ? getHintPair(tiles) : null,
      status,
    };
    const lastScoredMove = scoreState.history.at(-1);
    const pointsToRemove = lastScoredMove?.pointsEarned ?? BASE_PAIR_SCORE;
    const nextScoreState: ScoreState = {
      score: Math.max(0, scoreState.score - pointsToRemove),
      combo: 1,
      lastMatchSecond: null,
      history: scoreState.history.slice(0, -1),
    };

    setState(nextState);
    setScoreState(nextScoreState);
    queueSave(createSaveInput(nextState, nextScoreState));
    emitProgressSnapshot("manual", nextState, nextScoreState);
  }

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    if (state.status !== "playing" || lockedDifficulty) {
      return;
    }

    startMusic();
    resultSoundPlayedRef.current = false;
    setDifficulty(nextDifficulty);

    if (nextDifficulty === "hard") {
      setHighlightedHint([]);
    }
  }

  async function toggleFullscreen() {
    startMusic();

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await gameShellRef.current?.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }

  function togglePause() {
    if (state.status !== "playing" || pendingSave || !saveChecked) {
      return;
    }

    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    queueSave(createSaveInput(state, scoreState, { isPaused: nextPaused }));
  }

  function handleContinueSavedGame() {
    if (!pendingSave) {
      return;
    }

    const nextState = createBoardStateFromSave(pendingSave);
    const nextScoreState: ScoreState = {
      score: pendingSave.score,
      combo: pendingSave.comboMultiplier,
      lastMatchSecond: null,
      history: normalizeSavedMoves(pendingSave.undoStack),
    };

    completedSavedRef.current = false;
    winNotifiedRef.current = nextState.status !== "playing";
    lostNotifiedRef.current = nextState.status !== "playing";
    terminalSnapshotEmittedRef.current = nextState.status !== "playing";
    resultSoundPlayedRef.current = nextState.status !== "playing";
    setState(nextState);
    setDifficulty(pendingSave.difficulty);
    setScoreState(nextScoreState);
    setElapsedSeconds(pendingSave.elapsedSeconds);
    setHintsUsed(pendingSave.hintsUsed);
    setShufflesUsed(pendingSave.shufflesUsed);
    setHighlightedHint([]);
    setCoachOpen(false);
    setPendingSave(null);
    setIsPaused(false);
    queueSave({
      ...createSaveInput(nextState, nextScoreState, {
        difficulty: pendingSave.difficulty,
        elapsedSeconds: pendingSave.elapsedSeconds,
        hintsUsed: pendingSave.hintsUsed,
        isPaused: false,
      }),
      shufflesUsed: pendingSave.shufflesUsed,
    });
  }

  function handleStartFreshFromSave() {
    const nextState = createFreshBoardState();
    const nextScoreState = createInitialScoreState();

    completedSavedRef.current = false;
    winNotifiedRef.current = false;
    lostNotifiedRef.current = false;
    terminalSnapshotEmittedRef.current = false;
    resultSoundPlayedRef.current = false;
    setState(nextState);
    setDifficulty(lockedDifficulty ?? "easy");
    setScoreState(nextScoreState);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setShufflesUsed(0);
    setHighlightedHint([]);
    setCoachOpen(false);
    setPendingSave(null);
    setIsPaused(false);

    if (userId) {
      void clearCurrentGame(userId).catch((error) => {
        console.warn("Failed to clear current Zen Mahjong save:", error);
        showSaveWarning();
      });
    }
  }

  function handleShuffleFromGameOver() {
    if (!canShuffle) {
      return;
    }

    startMusic();
    setHighlightedHint([]);
    setNoMovesModalVisible(false);

    const nextState = shuffleRemainingTiles(state);
    const nextShufflesUsed = shufflesUsed + 1;

    if (nextState.status === "playing") {
      resultSoundPlayedRef.current = false;
      lostNotifiedRef.current = false;
      terminalSnapshotEmittedRef.current = false;
    }

    setShufflesUsed(nextShufflesUsed);
    setState(nextState);
    queueSave({
      ...createSaveInput(nextState, scoreState),
      shufflesUsed: nextShufflesUsed,
    });
    emitProgressSnapshot("shuffle", nextState, scoreState, { shufflesUsed: nextShufflesUsed });
  }

  return (
    <div
      ref={gameShellRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-background-mid p-4 shadow-glass md:p-6",
        "fullscreen:rounded-none fullscreen:border-0 fullscreen:bg-[#0E0E10]",
        isFullscreen ? "flex h-screen w-screen flex-col rounded-none border-0 bg-[#0E0E10] p-3 sm:p-4 md:p-5" : null,
        compact ? "min-h-[360px]" : "min-h-[560px]",
      )}
    >
      <div className="absolute inset-0 bg-zen-radial" />
      <div className="relative z-10 mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <GameStatCard icon={<Clock3 />} label="Время" value={formatElapsedTime(elapsedSeconds)} />
          <GameStatCard icon={<Star />} label="Очки" value={scoreState.score.toLocaleString("ru-RU")} />
          <GameStatCard
            label="Комбо"
            value={`x${scoreState.combo}`}
            progress={comboProgress}
            pulseKey={`${scoreState.history.length}-${scoreState.combo}`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 xl:justify-end">
          {showDifficultySelector && !lockedDifficulty ? (
            <div className="flex rounded-lg border border-primary/20 bg-popover/70 p-1">
              {difficulties.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDifficultyChange(item.id)}
                  disabled={state.status !== "playing"}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm",
                    difficulty === item.id
                      ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,107,53,0.35)]"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={togglePause}
            disabled={state.status !== "playing" || Boolean(pendingSave) || !saveChecked}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/20 bg-card/85 px-3 py-2 text-sm font-bold transition hover:border-primary/45 hover:bg-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-primary/20 disabled:hover:bg-card/85",
              isPaused ? "border-primary/55 bg-primary/15 text-primary" : "text-foreground",
            )}
          >
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {isPaused ? "Продолжить" : "Пауза"}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_148px]",
          isFullscreen ? "lg:grid-cols-[minmax(0,1fr)_132px]" : null,
        )}
      >
        <motion.div
          animate={
            noMovesModalVisible
              ? { opacity: 0.58, x: [0, -5, 5, -3, 3, 0] }
              : { opacity: 1, x: 0 }
          }
          transition={{ duration: noMovesModalVisible ? 0.44 : 0.2, ease: "easeOut" }}
          className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl border border-primary/10 bg-black/20 p-2 sm:p-3"
        >
          <div
            className={cn("relative w-full max-w-[940px]", isFullscreen ? "max-w-none" : null)}
            style={{
              aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
              width: isFullscreen ? `min(100%, calc((100vh - 178px) * ${BOARD_WIDTH / BOARD_HEIGHT}))` : "100%",
            }}
          >
            <AnimatePresence>
              {state.tiles.map((tile) =>
                tile.removed ? null : (
                  <motion.div
                    key={tile.id}
                    className="absolute aspect-[7/10]"
                    style={getTileStyle(tile)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.82, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <TileWithAvailability
                      tile={tile}
                      tiles={state.tiles}
                      compact={compact}
                      selected={state.selectedTileId === tile.id}
                      hinted={highlightedHint.includes(tile.id)}
                      muted={difficulty === "easy" && !isTileFree(tile, state.tiles)}
                      paused={interactionsLocked}
                      onSelect={() => handleSelect(tile.id)}
                    />
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {isPaused ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[1000] grid place-items-center bg-background/45 backdrop-blur-[2px]"
              >
                <div className="rounded-2xl border border-primary/25 bg-card/90 px-8 py-6 text-center shadow-glass">
                  <p className="font-display text-3xl font-black uppercase tracking-[0.08em] text-primary">Пауза</p>
                  <p className="mt-2 text-sm text-muted-foreground">Игра остановлена</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
        <GameActionDock
          availablePairsCount={availableMoves.length}
          canUndo={canUndo}
          coachOpen={coachOpen}
          hintHidden={!hintsEnabled || difficulty === "hard"}
          isFullscreen={isFullscreen}
          paused={interactionsLocked}
          onCoachToggle={() => setCoachOpen((current) => !current)}
          onFullscreenToggle={toggleFullscreen}
          onHint={handleHint}
          onRestart={handleRestart}
          onUndo={handleUndo}
          removedPairsCount={state.removedPairs.length}
          restartEnabled={restartEnabled}
          undoHidden={!undoEnabled}
        />
      </div>

      <div className="relative z-10 mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="text-primary">
            {removedCount}/144 собрано ·{" "}
            {state.status === "won" ? "Победа" : state.status === "lost" ? "Нет ходов" : `Пар: ${availableMoves.length}`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-zen-cta"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>
      <AnimatePresence>
        {persistGame && !saveChecked ? (
          <motion.div
            className="absolute inset-0 z-[1100] grid place-items-center bg-background/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-2xl border border-primary/25 bg-card/95 px-6 py-5 text-center shadow-glass">
              <p className="font-display text-xl font-black uppercase tracking-[0.08em] text-primary">
                Проверяем сохранение
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Ищем незавершённую игру...</p>
            </div>
          </motion.div>
        ) : null}
        {pendingSave ? (
          <SavedGamePrompt
            save={pendingSave}
            onContinue={handleContinueSavedGame}
            onStartFresh={handleStartFreshFromSave}
          />
        ) : null}
        {noMovesModalVisible ? (
          <GameOverModal
            canShuffle={canShuffle}
            shufflesRemaining={Math.max(0, MAX_SHUFFLES - shufflesUsed)}
            onNewGame={restartEnabled ? handleRestart : undefined}
            onShuffle={handleShuffleFromGameOver}
          />
        ) : null}
        {state.status === "won" ? <VictoryModal onNewGame={restartEnabled ? handleRestart : undefined} /> : null}
      </AnimatePresence>
    </div>
  );
}

function VictoryModal({ onNewGame }: { onNewGame?: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-[1250] grid place-items-center bg-background/68 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/30 bg-card/92 p-6 text-center shadow-glass backdrop-blur-2xl sm:p-8"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
        <div className="relative">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/15 text-primary shadow-[0_0_34px_rgba(255,136,0,0.28)]">
            <Trophy className="size-8" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.26em] text-purple-energy">Result</p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[0.06em] text-foreground sm:text-4xl">
            Победа
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Все плитки убраны с поля.
          </p>
          <div className={cn("mt-7 grid gap-3", onNewGame ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
            {onNewGame ? (
              <button
                type="button"
                onClick={onNewGame}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zen-cta px-4 py-3 font-display text-sm font-black uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_26px_rgba(255,107,53,0.28)] transition hover:brightness-110"
              >
                <RotateCcw className="size-4" />
                Новая игра
              </button>
            ) : null}
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-purple-energy/35 bg-purple-energy/12 px-4 py-3 text-sm font-bold text-foreground transition hover:border-purple-energy/60 hover:bg-purple-energy/18"
            >
              <Home className="size-4" />
              На главную
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SavedGamePrompt({
  save,
  onContinue,
  onStartFresh,
}: {
  save: CurrentGameSave;
  onContinue: () => void;
  onStartFresh: () => void;
}) {
  const removedCount = save.removedTileIds.length;
  const progress = Math.round((removedCount / Math.max(1, save.tiles.length)) * 100);

  return (
    <motion.div
      className="absolute inset-0 z-[1200] grid place-items-center bg-background/65 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        className="w-full max-w-md rounded-2xl border border-primary/25 bg-card/95 p-6 shadow-glass"
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Сохранение найдено</p>
        <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.06em] text-foreground">
          У вас есть незавершённая игра
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-primary/10 bg-popover/70 p-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Прогресс</p>
            <p className="font-bold text-primary">{progress}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Очки</p>
            <p className="font-bold">{save.score}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Время</p>
            <p className="font-bold">{formatGameTime(save.elapsedSeconds)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-zen-cta px-4 py-3 font-display text-sm font-black uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_24px_rgba(255,107,53,0.28)] transition hover:brightness-110"
          >
            Продолжить
          </button>
          <button
            type="button"
            onClick={onStartFresh}
            className="rounded-lg border border-primary/25 bg-popover px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary/50"
          >
            Начать заново
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GameOverModal({
  canShuffle,
  onNewGame,
  onShuffle,
  shufflesRemaining,
}: {
  canShuffle: boolean;
  onNewGame?: () => void;
  onShuffle: () => void;
  shufflesRemaining: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-[1250] grid place-items-center bg-[#07030d]/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/25 bg-[#100a16]/82 p-6 text-center shadow-[0_26px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-8"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
        <div className="relative">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/12 text-primary shadow-[0_0_34px_rgba(255,136,0,0.24)]">
            <AlertTriangle className="size-8" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.26em] text-purple-energy">Game Over</p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[0.06em] text-foreground sm:text-4xl">
            Ходов больше нет
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            На поле не осталось доступных пар.
          </p>
          <div className={cn("mt-7 grid gap-3", onNewGame ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            <button
              type="button"
              onClick={onShuffle}
              disabled={!canShuffle}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-bold text-primary transition hover:border-primary/60 hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-primary/30 disabled:hover:bg-primary/15"
              title={shufflesRemaining > 0 ? `Осталось: ${shufflesRemaining}` : "Перемешивания закончились"}
            >
              <Shuffle className="size-4" />
              Перемешать
            </button>
            {onNewGame ? (
              <button
                type="button"
                onClick={onNewGame}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zen-cta px-4 py-3 font-display text-sm font-black uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_26px_rgba(255,107,53,0.28)] transition hover:brightness-110"
              >
                <RotateCcw className="size-4" />
                Новая игра
              </button>
            ) : null}
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-purple-energy/35 bg-purple-energy/12 px-4 py-3 text-sm font-bold text-foreground transition hover:border-purple-energy/60 hover:bg-purple-energy/18"
            >
              <Home className="size-4" />
              На главную
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GameStatCard({
  icon,
  label,
  progress,
  pulseKey,
  value,
}: {
  icon?: ReactNode;
  label: string;
  progress?: number;
  pulseKey?: string;
  value: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-popover/70 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {icon ? <span className="text-primary [&_svg]:size-4">{icon}</span> : null}
        {label}
      </div>
      <motion.p
        key={pulseKey ?? value}
        initial={{ scale: 0.96, opacity: 0.72 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-1 font-display text-lg font-black uppercase tracking-[0.04em] text-foreground sm:text-2xl"
      >
        {value}
      </motion.p>
      {typeof progress === "number" ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full bg-zen-cta" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
        </div>
      ) : null}
    </div>
  );
}

function GameActionDock({
  availablePairsCount,
  canUndo,
  coachOpen,
  hintHidden,
  isFullscreen,
  paused,
  onCoachToggle,
  onFullscreenToggle,
  onHint,
  onRestart,
  onUndo,
  removedPairsCount,
  restartEnabled,
  undoHidden,
}: {
  availablePairsCount: number;
  canUndo: boolean;
  coachOpen: boolean;
  hintHidden: boolean;
  isFullscreen: boolean;
  paused: boolean;
  onCoachToggle: () => void;
  onFullscreenToggle: () => void;
  onHint: () => void;
  onRestart: () => void;
  onUndo: () => void;
  removedPairsCount: number;
  restartEnabled: boolean;
  undoHidden: boolean;
}) {
  return (
    <aside className="flex min-w-0 flex-col gap-3">
      <div className="flex gap-3 overflow-x-auto rounded-xl border border-primary/10 bg-black/20 p-2 lg:flex-col lg:overflow-visible">
        <GameActionButton
          label="Подсказка"
          icon={<Lightbulb />}
          onClick={onHint}
          hidden={hintHidden}
          disabled={paused || availablePairsCount === 0}
          className="lg:min-h-24"
        />
        {undoHidden ? null : (
          <GameActionButton
            label="Отмена"
            icon={<RotateCcw />}
            onClick={onUndo}
            disabled={paused || !canUndo}
            className="lg:min-h-24"
          />
        )}
        <GameActionButton
          label="AI Тренер"
          icon={<Bot />}
          onClick={onCoachToggle}
          disabled={paused}
          active={coachOpen}
          className="lg:min-h-24"
        />
        <GameActionButton
          label={isFullscreen ? "Выйти" : "Полный экран"}
          icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
          onClick={onFullscreenToggle}
          active={isFullscreen}
          className="lg:min-h-24"
        />
      </div>
      <AnimatePresence>
        {coachOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-primary/20 bg-card/90 p-4 text-sm shadow-glass backdrop-blur-md"
          >
            <p className="font-display text-base font-black uppercase tracking-[0.06em] text-primary">AI Тренер</p>
            <p className="mt-3 leading-6 text-muted-foreground">
              Совет: сначала освобождайте верхние и боковые плитки. Сейчас доступно пар:{" "}
              <span className="font-bold text-foreground">{availablePairsCount}</span>. Лучший ход — выбрать пару,
              которая откроет больше плиток.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Собрано пар: {removedPairsCount}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {restartEnabled ? (
        <button
          type="button"
          onClick={onRestart}
          disabled={paused}
          className="rounded-lg border border-primary/15 bg-popover/70 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Заново
        </button>
      ) : null}
    </aside>
  );
}

function TileWithAvailability({
  tile,
  tiles,
  compact,
  selected,
  hinted,
  muted,
  paused,
  onSelect,
}: {
  tile: MahjongTileModel;
  tiles: readonly MahjongTileModel[];
  compact?: boolean;
  selected: boolean;
  hinted: boolean;
  muted: boolean;
  paused: boolean;
  onSelect: () => void;
}) {
  const free = isTileFree(tile, tiles);
  const visuallyCovered = muted && isTileVisuallyCoveredByCenterTop(tile, tiles);

  return (
    <MahjongTile
      tile={tile}
      compact={compact}
      free={free}
      selected={selected}
      hinted={hinted}
      muted={muted}
      visuallyCovered={visuallyCovered}
      pointerEventsDisabled={paused || (visuallyCovered && !free)}
      positioned={false}
      onSelect={onSelect}
    />
  );
}
