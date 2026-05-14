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
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { GameActionButton } from "@/components/game/game-action-button";
import { MahjongTile } from "@/components/game/mahjong-tile";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { ResourceEmptyDialog } from "@/components/shop/resource-empty-dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { playSound } from "@/src/lib/audio";
import { AUDIO_ASSETS } from "@/src/lib/audio/audio-assets";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";
import {
  DEFAULT_ECONOMY,
  ECONOMY_STORAGE_KEY,
  ECONOMY_UPDATED_EVENT,
  createDefaultPlayerEconomy,
  getPlayerEconomy,
  updateCoinBalance,
  updateHintBalance,
  updateUndoBalance,
  type PlayerEconomy,
} from "@/src/lib/economy/economy-service";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
  type CurrentGameSave,
  type CurrentGameSaveInput,
  type SavedGameDifficulty,
  type SavedGameMove,
} from "@/src/lib/game-save";
import { buildGameResultFromState, saveGameResultWithFallback } from "@/src/lib/stats/game-history-service";
import {
  checkGameStatus,
  createInitialBoardState,
  findAvailableMoves,
  getHintPair,
  isTileFree,
  selectTile,
} from "@/src/lib/game";
import type { BoardState, MahjongTileModel } from "@/src/lib/game";

const BASE_PAIR_SCORE = 50;
const COMBO_WINDOW_SECONDS = 5;
const TILE_EXIT_ANIMATION_MS = 260;
const TILE_DEAL_DURATION_SECONDS = 0.32;
const TILE_DEAL_DELAY_STEP_SECONDS = 0.0055;
const TILE_DEAL_MAX_DELAY_SECONDS = 0.78;
const TILE_DEAL_LOCK_MS = 1150;

export type Difficulty = "easy" | "medium" | "hard";
type ScoredMove = SavedGameMove & Required<Pick<SavedGameMove, "pointsEarned" | "comboAtMove" | "timestamp">>;
type ScoreState = {
  score: number;
  combo: number;
  lastMatchSecond: number | null;
  history: ScoredMove[];
};

type ResourceDialogState = {
  title: string;
  description: string;
  shopLabel: string;
};

type LocalSessionSnapshot = {
  state: BoardState;
  scoreState: ScoreState;
  difficulty: Difficulty;
  elapsedSeconds: number;
  hintsUsed: number;
  undoUsed: number;
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
    left: `calc(var(--board-offset-x) + var(--tile-x-step) * ${tile.x} + var(--tile-depth) * ${tile.z})`,
    top: `calc(var(--board-offset-y) + var(--tile-y-step) * ${tile.y} + var(--tile-depth) * ${tile.z})`,
    width: "var(--tile-w)",
    height: "var(--tile-h)",
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

function createGameSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  tournamentResultMode = false,
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
  tournamentResultMode?: boolean;
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
  const localResultSavedRef = useRef(false);
  const dealTimeoutRef = useRef<number | null>(null);
  const hintClearTimeoutRef = useRef<number | null>(null);
  const coinRewardSavedRef = useRef(Boolean(initialSnapshot?.completed || initialSnapshot?.lost));
  const sessionIdRef = useRef(createGameSessionId());
  const sessionStartedAtRef = useRef(new Date().toISOString());
  const latestLocalSessionRef = useRef<LocalSessionSnapshot | null>(null);
  const latestProgressSnapshotRef = useRef<MahjongBoardProgressSnapshot | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const initialDifficulty = lockedDifficulty ?? initialSnapshot?.difficulty ?? "easy";
  const [state, setState] = useState<BoardState>(() =>
    initialSnapshot
      ? createBoardStateFromSnapshot(initialSnapshot)
      : initialTiles
        ? createBoardStateFromTiles(initialTiles)
        : createInitialBoardState({ mode: "regular", difficulty: initialDifficulty }),
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
  const [undoUsed, setUndoUsed] = useState(0);
  const [noMovesModalVisible, setNoMovesModalVisible] = useState(false);
  const [boardAnimationKey, setBoardAnimationKey] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [resourceDialog, setResourceDialog] = useState<ResourceDialogState | null>(null);
  const [economy, setEconomy] = useState<PlayerEconomy>(() => ({
    coins: DEFAULT_ECONOMY.coins,
    gems: DEFAULT_ECONOMY.gems,
    hints: DEFAULT_ECONOMY.hints,
    undos: DEFAULT_ECONOMY.undos,
    updatedAt: new Date().toISOString(),
  }));
  const { setSoundEnabled, soundEnabled } = useSoundPreference();
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

  const createFreshBoardState = useCallback(() => {
    if (initialSnapshot && !restartEnabled) {
      return createBoardStateFromSnapshot(initialSnapshot);
    }

    return initialTiles
      ? createBoardStateFromTiles(initialTiles)
      : createInitialBoardState({ mode: "regular", difficulty: lockedDifficulty ?? difficulty });
  }, [difficulty, initialSnapshot, initialTiles, lockedDifficulty, restartEnabled]);

  const startDealAnimation = useCallback(() => {
    if (dealTimeoutRef.current) {
      window.clearTimeout(dealTimeoutRef.current);
    }

    setIsDealing(true);
    setBoardAnimationKey((current) => current + 1);
    dealTimeoutRef.current = window.setTimeout(() => {
      dealTimeoutRef.current = null;
      setIsDealing(false);
    }, TILE_DEAL_LOCK_MS);
  }, []);

  const activeTiles = useMemo(() => state.tiles.filter((tile) => !tile.removed), [state.tiles]);
  const availableMoves = useMemo(() => findAvailableMoves(state.tiles), [state.tiles]);
  const dealIndexByTileId = useMemo(() => {
    return new Map(
      [...state.tiles]
        .sort((first, second) => first.z - second.z || first.y - second.y || first.x - second.x || first.id.localeCompare(second.id))
        .map((tile, index) => [tile.id, index]),
    );
  }, [state.tiles]);
  const removedCount = state.tiles.length - activeTiles.length;
  const progress = Math.round((removedCount / Math.max(1, state.tiles.length)) * 100);
  const canUndo = undoEnabled && state.removedPairs.length > 0;
  const interactionsLocked = isPaused || isDealing || state.status !== "playing" || Boolean(pendingSave) || !saveChecked;
  const terminalLost = state.status === "lost" && activeTiles.length > 0;
  const comboRemainingSeconds =
    scoreState.lastMatchSecond === null
      ? 0
      : Math.max(0, COMBO_WINDOW_SECONDS - (elapsedSeconds - scoreState.lastMatchSecond));
  const comboProgress = scoreState.lastMatchSecond === null ? 0 : (comboRemainingSeconds / COMBO_WINDOW_SECONDS) * 100;
  const userId = persistGame ? user?.uid : undefined;
  const canTogglePause = state.status === "playing" && !isDealing && !pendingSave && saveChecked;

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
        lost: nextState.status === "lost" && nextActiveTiles.length > 0,
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
    latestLocalSessionRef.current = {
      state,
      scoreState,
      difficulty,
      elapsedSeconds,
      hintsUsed,
      undoUsed,
    };
  }, [difficulty, elapsedSeconds, hintsUsed, scoreState, state, undoUsed]);

  const resetLocalSession = useCallback(() => {
    sessionIdRef.current = createGameSessionId();
    sessionStartedAtRef.current = new Date().toISOString();
    localResultSavedRef.current = false;
  }, []);

  const saveGameResult = useCallback(
    (status: "won" | "lost" | "unfinished", reason: "win" | "no_moves" | "new_game" | "exit" | "restart") => {
      if (localResultSavedRef.current && status !== "unfinished") {
        return;
      }

      const snapshot = latestLocalSessionRef.current;

      if (!snapshot) {
        return;
      }

      const matchedPairs = snapshot.state.removedPairs.length;
      const hasMeaningfulProgress =
        snapshot.scoreState.score > 0 || matchedPairs > 0 || snapshot.elapsedSeconds > 5;

      if (status === "unfinished" && (!hasMeaningfulProgress || localResultSavedRef.current)) {
        return;
      }

      const result = buildGameResultFromState({
        id: sessionIdRef.current,
        mode: tournamentResultMode ? "tournament" : "regular",
        difficulty: snapshot.difficulty,
        status,
        reason,
        score: snapshot.scoreState.score,
        timeSeconds: snapshot.elapsedSeconds,
        moves: matchedPairs,
        matchedPairs,
        totalPairs: Math.max(1, Math.floor(snapshot.state.tiles.length / 2)),
        maxCombo: Math.max(0, ...snapshot.scoreState.history.map((move) => move.comboAtMove)),
        hintsUsed: snapshot.hintsUsed,
        undoUsed: snapshot.undoUsed,
        startedAt: sessionStartedAtRef.current,
      });

      void saveGameResultWithFallback(result, user?.uid);
      localResultSavedRef.current = true;
    },
    [tournamentResultMode, user?.uid],
  );

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
    setUndoUsed(0);
    setDifficulty(lockedDifficulty ?? initialSnapshot?.difficulty ?? "easy");
    setScoreState(nextScoreState);
    completedSavedRef.current = false;
    winNotifiedRef.current = nextState.status !== "playing";
    lostNotifiedRef.current = nextState.status !== "playing";
    terminalSnapshotEmittedRef.current = nextState.status !== "playing";
    resultSoundPlayedRef.current = nextState.status !== "playing";
    coinRewardSavedRef.current = nextState.status !== "playing";
    resetLocalSession();
    localResultSavedRef.current = nextState.status !== "playing";
    setState(nextState);
  }, [initialSnapshot, initialStateKey, initialTiles, lockedDifficulty, persistGame, resetLocalSession]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;
    const userIdForEconomy = user?.uid;
    setEconomy(createDefaultPlayerEconomy(userIdForEconomy));

    const refreshEconomy = () => {
      void getPlayerEconomy(userIdForEconomy)
        .then((nextEconomy) => {
          if (!cancelled) {
            setEconomy(nextEconomy);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setEconomy(createDefaultPlayerEconomy(userIdForEconomy));
          }
        });
    };

    refreshEconomy();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ECONOMY_STORAGE_KEY) {
        refreshEconomy();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);
    };
  }, [authLoading, user?.uid]);

  useEffect(() => {
    setAudioMuted(!soundEnabled);
  }, [setAudioMuted, soundEnabled]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    if (dealTimeoutRef.current) {
      window.clearTimeout(dealTimeoutRef.current);
    }
    if (hintClearTimeoutRef.current) {
      window.clearTimeout(hintClearTimeoutRef.current);
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
    const saveExitResult = () => {
      saveGameResult("unfinished", "exit");
    };

    window.addEventListener("beforeunload", saveExitResult);

    return () => {
      saveExitResult();
      window.removeEventListener("beforeunload", saveExitResult);
    };
  }, [saveGameResult]);

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

    void clearCurrentGame(userId).catch((error) => {
      console.warn("Failed to clear completed Zen Mahjong save:", error);
      showSaveWarning();
    });
  }, [
    persistGame,
    showSaveWarning,
    state.status,
    userId,
  ]);

  useEffect(() => {
    if (state.status === "won") {
      saveGameResult("won", "win");
      return;
    }

    if (terminalLost) {
      saveGameResult("lost", "no_moves");
    }
  }, [saveGameResult, state.status, terminalLost]);

  useEffect(() => {
    if (coinRewardSavedRef.current) {
      return;
    }

    const rewardCoins = state.status === "won" ? 100 : terminalLost ? 25 : 0;

    if (rewardCoins <= 0) {
      return;
    }

    coinRewardSavedRef.current = true;
    void updateCoinBalance(rewardCoins, user?.uid)
      .then(setEconomy)
      .catch(() => {
        toast({
          title: "Монеты не синхронизированы",
          description: "Награда не была сохранена. Проверьте подключение и попробуйте позже.",
          variant: "destructive",
        });
      });
  }, [state.status, terminalLost, toast, user?.uid]);

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

    if (economy.hints <= 0) {
      setResourceDialog({
        title: "Подсказки закончились",
        description: "У вас больше нет подсказок. Можно купить дополнительные подсказки в магазине.",
        shopLabel: "Купить подсказки",
      });
      return;
    }

    setHighlightedHint([pair.firstId, pair.secondId]);
    setHintsUsed((current) => current + 1);
    const economyBeforeHint = economy;
    setEconomy((current) => ({
      ...current,
      hints: Math.max(0, current.hints - 1),
      updatedAt: new Date().toISOString(),
    }));
    void updateHintBalance(-1, user?.uid)
      .then((nextEconomy) => {
        setEconomy(nextEconomy);
        if (nextEconomy.hints <= 0) {
          setResourceDialog({
            title: "Подсказки закончились",
            description: "Вы использовали последнюю подсказку. Хотите купить ещё в магазине?",
            shopLabel: "Купить подсказки",
          });
        }
      })
      .catch(() => {
        setEconomy(economyBeforeHint);
        toast({
          title: "Подсказка не синхронизирована",
          description: "Баланс не был сохранён. Проверьте подключение и попробуйте позже.",
          variant: "destructive",
        });
      });
    if (hintClearTimeoutRef.current) {
      window.clearTimeout(hintClearTimeoutRef.current);
    }
    hintClearTimeoutRef.current = window.setTimeout(() => {
      hintClearTimeoutRef.current = null;
      setHighlightedHint([]);
    }, 1800);
  }

  function handleRestart() {
    if (!restartEnabled) {
      return;
    }

    if (state.status === "playing") {
      saveGameResult("unfinished", "new_game");
    }

    startMusic();
    setHighlightedHint([]);
    setCoachOpen(false);
    setIsPaused(false);
    setNoMovesModalVisible(false);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setShufflesUsed(0);
    setUndoUsed(0);
    setScoreState(createInitialScoreState());
    const nextState = createFreshBoardState();
    completedSavedRef.current = false;
    winNotifiedRef.current = false;
    lostNotifiedRef.current = false;
    terminalSnapshotEmittedRef.current = false;
    resultSoundPlayedRef.current = false;
    coinRewardSavedRef.current = false;
    resetLocalSession();
    setState(nextState);
    startDealAnimation();

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

    if (economy.undos <= 0) {
      setResourceDialog({
        title: "Отмена хода закончилась",
        description: "У вас больше нет отмен хода. Можно купить дополнительные отмены в магазине.",
        shopLabel: "Открыть магазин",
      });
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
    setUndoUsed((current) => current + 1);
    const economyBeforeUndo = economy;
    setEconomy((current) => ({
      ...current,
      undos: Math.max(0, current.undos - 1),
      updatedAt: new Date().toISOString(),
    }));
    void updateUndoBalance(-1, user?.uid)
      .then((nextEconomy) => {
        setEconomy(nextEconomy);
        if (nextEconomy.undos <= 0) {
          setResourceDialog({
            title: "Это была последняя отмена",
            description: "Вы использовали последнюю отмену хода. Хотите купить ещё в магазине?",
            shopLabel: "Купить в магазине",
          });
        }
      })
      .catch(() => {
        setEconomy(economyBeforeUndo);
        toast({
          title: "Отмена не синхронизирована",
          description: "Баланс не был сохранён. Проверьте подключение и попробуйте позже.",
          variant: "destructive",
        });
      });
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
    if (!canTogglePause) {
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
    coinRewardSavedRef.current = nextState.status !== "playing";
    resetLocalSession();
    localResultSavedRef.current = nextState.status !== "playing";
    setState(nextState);
    setDifficulty(pendingSave.difficulty);
    setScoreState(nextScoreState);
    setElapsedSeconds(pendingSave.elapsedSeconds);
    setHintsUsed(pendingSave.hintsUsed);
    setShufflesUsed(pendingSave.shufflesUsed);
    setUndoUsed(0);
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
    if (pendingSave) {
      const savedRemovedPairs = Math.floor(pendingSave.removedTileIds.length / 2);
      const hasMeaningfulSavedProgress = pendingSave.score > 0 || savedRemovedPairs > 0 || pendingSave.elapsedSeconds > 5;

      if (hasMeaningfulSavedProgress) {
        void saveGameResultWithFallback(
          buildGameResultFromState({
            id: sessionIdRef.current,
            mode: tournamentResultMode ? "tournament" : "regular",
            difficulty: pendingSave.difficulty,
            status: "unfinished",
            reason: "restart",
            score: pendingSave.score,
            timeSeconds: pendingSave.elapsedSeconds,
            moves: savedRemovedPairs,
            matchedPairs: savedRemovedPairs,
            totalPairs: Math.max(1, Math.floor(pendingSave.tiles.length / 2)),
            maxCombo: Math.max(0, ...pendingSave.undoStack.map((move) => move.comboAtMove ?? 0)),
            hintsUsed: pendingSave.hintsUsed,
            undoUsed,
            startedAt: sessionStartedAtRef.current,
          }),
          user?.uid,
        );
      }
    }

    const nextState = createFreshBoardState();
    const nextScoreState = createInitialScoreState();

    completedSavedRef.current = false;
    winNotifiedRef.current = false;
    lostNotifiedRef.current = false;
    terminalSnapshotEmittedRef.current = false;
    resultSoundPlayedRef.current = false;
    coinRewardSavedRef.current = false;
    resetLocalSession();
    setState(nextState);
    startDealAnimation();
    setDifficulty(lockedDifficulty ?? "easy");
    setScoreState(nextScoreState);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setShufflesUsed(0);
    setUndoUsed(0);
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

  return (
    <div
      ref={gameShellRef}
      className={cn(
        "mahjong-game-shell relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background-mid p-2 shadow-glass sm:p-3 md:rounded-2xl md:p-6",
        "fullscreen:rounded-none fullscreen:border-0 fullscreen:bg-[#0E0E10]",
        isFullscreen
          ? "flex h-dvh w-screen flex-col overflow-auto rounded-none border-0 bg-[#0E0E10] p-3 pt-20 pb-28 sm:p-4 sm:pt-20 sm:pb-28 md:p-5 md:pt-24 md:pb-28"
          : null,
        compact ? "min-h-[360px]" : "min-h-[calc(100svh-96px)] md:min-h-[560px]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-zen-radial" />
      {isFullscreen ? (
        <FullscreenGameHeader
          coins={economy.coins}
          gems={economy.gems}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled((current) => !current)}
        />
      ) : null}
      <div className="relative z-10 mb-2 grid gap-2 md:mb-4 md:gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5 sm:gap-2 md:gap-3">
          <GameStatCard icon={<Clock3 />} label="Время" value={formatElapsedTime(elapsedSeconds)} />
          <GameStatCard icon={<Star />} label="Очки" value={scoreState.score.toLocaleString("ru-RU")} />
          <GameStatCard icon={<Lightbulb />} label="Подсказки" value={economy.hints.toLocaleString("ru-RU")} />
          <GameStatCard icon={<RotateCcw />} label="Отмены" value={economy.undos.toLocaleString("ru-RU")} />
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
            disabled={!canTogglePause}
            className={cn(
              "hidden min-h-10 items-center gap-2 rounded-lg border border-primary/20 bg-card/85 px-3 py-2 text-sm font-bold transition hover:border-primary/45 hover:bg-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex",
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
          "relative z-10 grid min-h-0 flex-1 gap-2 md:gap-4 lg:grid-cols-[minmax(0,1fr)_148px]",
          isFullscreen ? "pb-10 lg:grid-cols-[minmax(0,1fr)_132px] lg:pb-6" : null,
        )}
      >
        <motion.div
          animate={
            noMovesModalVisible
              ? { opacity: 0.58, x: [0, -5, 5, -3, 3, 0] }
              : { opacity: 1, x: 0 }
          }
          transition={{ duration: noMovesModalVisible ? 0.44 : 0.2, ease: "easeOut" }}
          className={cn(
            "relative flex min-h-0 items-center justify-center overflow-hidden rounded-lg border border-primary/10 bg-black/20 p-0.5 sm:p-2 md:rounded-xl md:p-3",
            isFullscreen ? "min-h-[calc(100dvh-270px)] lg:min-h-[calc(100dvh-245px)]" : null,
          )}
        >
          <div
            className={cn(
              "mahjong-board-stage relative mx-auto max-w-full select-none",
              isFullscreen ? "mahjong-board-stage--fullscreen max-w-none" : null,
            )}
          >
            <AnimatePresence>
              {state.tiles.map((tile) =>
                tile.removed ? null : (
                  <motion.div
                    key={`${boardAnimationKey}:${tile.id}`}
                    className="absolute"
                    style={getTileStyle(tile)}
                    initial={
                      boardAnimationKey > 0
                        ? { opacity: 0, scale: 0.85, y: -20 }
                        : { opacity: 0, scale: 0.96, y: 10 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.82, y: -8 }}
                    transition={{
                      duration: boardAnimationKey > 0 ? TILE_DEAL_DURATION_SECONDS : 0.22,
                      delay:
                        boardAnimationKey > 0
                          ? Math.min(
                              (dealIndexByTileId.get(tile.id) ?? 0) * TILE_DEAL_DELAY_STEP_SECONDS,
                              TILE_DEAL_MAX_DELAY_SECONDS,
                            )
                          : 0,
                      ease: "easeOut",
                    }}
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
          hintCount={economy.hints}
          hintHidden={!hintsEnabled || difficulty === "hard"}
          isFullscreen={isFullscreen}
          paused={interactionsLocked}
          undoCount={economy.undos}
          onCoachToggle={() => setCoachOpen((current) => !current)}
          onFullscreenToggle={toggleFullscreen}
          onHint={handleHint}
          onPauseToggle={togglePause}
          onRestart={handleRestart}
          onUndo={handleUndo}
          pauseDisabled={!canTogglePause}
          pausedByUser={isPaused}
          removedPairsCount={state.removedPairs.length}
          restartEnabled={restartEnabled}
          undoHidden={!undoEnabled}
        />
      </div>

      <div className="relative z-10 mt-2 pb-20 md:mt-4 md:pb-0">
        <div className="mb-2 flex justify-between text-xs sm:text-sm">
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
            onNewGame={restartEnabled ? handleRestart : undefined}
          />
        ) : null}
        {state.status === "won" ? (
          <VictoryModal
            onNewGame={restartEnabled ? handleRestart : undefined}
            tournamentResultMode={tournamentResultMode}
          />
        ) : null}
      </AnimatePresence>
      <ResourceEmptyDialog
        open={Boolean(resourceDialog)}
        title={resourceDialog?.title ?? ""}
        description={resourceDialog?.description ?? ""}
        shopLabel={resourceDialog?.shopLabel}
        onOpenChange={(open) => {
          if (!open) {
            setResourceDialog(null);
          }
        }}
      />
    </div>
  );
}

function FullscreenGameHeader({
  coins,
  gems,
  onSoundToggle,
  soundEnabled,
}: {
  coins: number;
  gems: number;
  onSoundToggle: () => void;
  soundEnabled: boolean;
}) {
  const label = soundEnabled ? "Звук включён" : "Звук выключен";
  const Icon = soundEnabled ? Volume2 : VolumeX;

  return (
    <header className="fixed inset-x-0 top-0 z-[1150] border-b border-primary/20 bg-[#0E0E10]/88 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-2 px-2 sm:px-4 md:h-16 md:px-5">
        <Link
          href="/dashboard"
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-popover px-2.5 text-sm font-bold text-foreground transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-h-10 md:px-4"
        >
          <Home className="size-4 text-primary" />
          <span className="hidden sm:inline">Главная</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <CurrencyPill type="coins" value={coins} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
          <CurrencyPill type="gems" value={gems} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
          <button
            type="button"
            onClick={onSoundToggle}
            aria-label={label}
            title={label}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-popover text-primary shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-primary/45 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:size-10"
          >
            <Icon className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function VictoryModal({
  onNewGame,
  tournamentResultMode = false,
}: {
  onNewGame?: () => void;
  tournamentResultMode?: boolean;
}) {
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
            {tournamentResultMode && !onNewGame ? "Турнир на сегодня завершён." : "Все плитки убраны с поля."}
          </p>
          <div
            className={cn(
              "mt-7 grid gap-3",
              tournamentResultMode ? (onNewGame ? "sm:grid-cols-3" : "sm:grid-cols-2") : onNewGame ? "sm:grid-cols-2" : "sm:grid-cols-1",
            )}
          >
            {tournamentResultMode ? (
              <Link
                href="/leaderboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/14 px-4 py-3 text-sm font-bold text-primary transition hover:border-primary/60 hover:bg-primary/20"
              >
                <Trophy className="size-4" />
                Посмотреть рейтинг
              </Link>
            ) : null}
            {onNewGame ? (
              <button
                type="button"
                onClick={onNewGame}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zen-cta px-4 py-3 font-display text-sm font-black uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_26px_rgba(255,107,53,0.28)] transition hover:brightness-110"
              >
                <RotateCcw className="size-4" />
                {tournamentResultMode ? "Играть снова" : "Новая игра"}
              </button>
            ) : null}
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-purple-energy/35 bg-purple-energy/12 px-4 py-3 text-sm font-bold text-foreground transition hover:border-purple-energy/60 hover:bg-purple-energy/18"
            >
              <Home className="size-4" />
              {tournamentResultMode ? "На дэшборд" : "На главную"}
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
      className="absolute inset-0 z-[1200] grid place-items-center bg-black/70 p-3 backdrop-blur-2xl sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        className="w-full max-w-md rounded-2xl border border-primary/35 bg-[#0f0f12]/90 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.82),0_0_42px_rgba(255,107,53,0.14)] backdrop-blur-2xl sm:p-6"
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary drop-shadow-[0_0_18px_rgba(255,107,53,0.32)]">
          Сохранение найдено
        </p>
        <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.06em] text-foreground">
          У вас есть незавершённая игра
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-primary/25 bg-[#0a0a0c]/75 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_rgba(0,0,0,0.36)]">
          <div>
            <p className="text-xs font-semibold text-foreground/70">Прогресс</p>
            <p className="mt-1 font-bold text-primary">{progress}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/70">Очки</p>
            <p className="mt-1 font-bold text-foreground">{save.score}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/70">Время</p>
            <p className="mt-1 font-bold text-foreground">{formatGameTime(save.elapsedSeconds)}</p>
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
            className="rounded-lg border border-primary/30 bg-[#161616]/95 px-4 py-3 text-sm font-bold text-foreground shadow-[0_14px_38px_rgba(0,0,0,0.32)] transition hover:border-primary/55 hover:bg-[#1d1d1f]"
          >
            Новая игра
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GameOverModal({
  onNewGame,
}: {
  onNewGame?: () => void;
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
    <div className="relative min-w-0 overflow-hidden rounded-lg border border-primary/15 bg-popover/70 px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md md:rounded-xl md:px-3 md:py-2">
      <div className="flex items-center gap-1.5 truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:text-xs md:gap-2 md:tracking-[0.14em]">
        {icon ? <span className="text-primary [&_svg]:size-3.5 md:[&_svg]:size-4">{icon}</span> : null}
        {label}
      </div>
      <motion.p
        key={pulseKey ?? value}
        initial={{ scale: 0.96, opacity: 0.72 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-0.5 truncate font-display text-base font-black uppercase tracking-[0.04em] text-foreground sm:text-xl md:mt-1 md:text-2xl"
      >
        {value}
      </motion.p>
      {typeof progress === "number" ? (
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted md:mt-2">
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
  hintCount,
  hintHidden,
  isFullscreen,
  paused,
  onCoachToggle,
  onFullscreenToggle,
  onHint,
  onPauseToggle,
  onRestart,
  onUndo,
  pauseDisabled,
  pausedByUser,
  removedPairsCount,
  restartEnabled,
  undoCount,
  undoHidden,
}: {
  availablePairsCount: number;
  canUndo: boolean;
  coachOpen: boolean;
  hintCount: number;
  hintHidden: boolean;
  isFullscreen: boolean;
  paused: boolean;
  onCoachToggle: () => void;
  onFullscreenToggle: () => void;
  onHint: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onUndo: () => void;
  pauseDisabled: boolean;
  pausedByUser: boolean;
  removedPairsCount: number;
  restartEnabled: boolean;
  undoCount: number;
  undoHidden: boolean;
}) {
  const hintLabel = hintCount <= 0 ? "Нет подсказок" : `Подсказка · ${hintCount}`;
  const undoLabel = undoCount <= 0 ? "Нет отмен" : `Отмена · ${undoCount}`;
  const hintsEmpty = hintCount <= 0;
  const undosEmpty = undoCount <= 0;

  return (
    <aside
      className={cn(
        "z-30 -mx-1 flex min-w-0 flex-col gap-2 lg:static lg:mx-0 lg:gap-3",
        isFullscreen ? "relative bottom-auto" : "sticky bottom-20",
      )}
    >
      <div className="flex gap-2 overflow-x-auto rounded-xl border border-primary/15 bg-card/92 p-1.5 shadow-glass backdrop-blur-xl lg:flex-col lg:gap-3 lg:bg-black/20 lg:p-2 lg:shadow-none lg:backdrop-blur-none lg:overflow-visible">
        <GameActionButton
          label={pausedByUser ? "Старт" : "Пауза"}
          icon={pausedByUser ? <Play /> : <Pause />}
          onClick={onPauseToggle}
          disabled={pauseDisabled}
          active={pausedByUser}
          className="lg:min-h-24"
        />
        <GameActionButton
          label={hintLabel}
          icon={<Lightbulb />}
          onClick={onHint}
          hidden={hintHidden}
          disabled={paused || availablePairsCount === 0 || hintsEmpty}
          className="lg:min-h-24"
        />
        {!hintHidden && hintsEmpty ? (
          <div className="min-w-[168px] rounded-lg border border-primary/25 bg-primary/10 p-2 text-xs font-semibold text-orange-glow lg:min-w-0">
            <p>Подсказки закончились</p>
            <Link href="/shop" className="mt-1 inline-flex text-primary underline underline-offset-4">
              Купить подсказки
            </Link>
          </div>
        ) : null}
        {undoHidden ? null : (
          <GameActionButton
            label={undoLabel}
            icon={<RotateCcw />}
            onClick={onUndo}
            disabled={paused || !canUndo}
            className="lg:min-h-24"
          />
        )}
        {!undoHidden && undosEmpty ? (
          <div className="min-w-[168px] rounded-lg border border-purple-energy/25 bg-purple-energy/10 p-2 text-xs font-semibold text-purple-200 lg:min-w-0">
            <p>Отмены закончились</p>
            <Link href="/shop" className="mt-1 inline-flex text-purple-energy underline underline-offset-4">
              Купить отмены
            </Link>
          </div>
        ) : null}
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
          className="hidden rounded-lg border border-primary/15 bg-popover/70 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 lg:block"
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
