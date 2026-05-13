"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Clock3,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { GameActionButton } from "@/components/game/game-action-button";
import { MahjongTile } from "@/components/game/mahjong-tile";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
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
  findAvailablePairs,
  getHintPair,
  isTileFree,
  selectTile,
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

type Difficulty = "easy" | "medium" | "hard";
type ScoredMove = SavedGameMove & Required<Pick<SavedGameMove, "pointsEarned" | "comboAtMove" | "timestamp">>;
type ScoreState = {
  score: number;
  combo: number;
  lastMatchSecond: number | null;
  history: ScoredMove[];
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

export function MahjongBoard({ compact = false, persistGame = false }: { compact?: boolean; persistGame?: boolean }) {
  const gameShellRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const latestSaveRef = useRef<CurrentGameSaveInput | null>(null);
  const saveWarningShownRef = useRef(false);
  const completedSavedRef = useRef(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<BoardState>(() => createInitialBoardState());
  const [highlightedHint, setHighlightedHint] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [coachOpen, setCoachOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(persistGame);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pendingSave, setPendingSave] = useState<CurrentGameSave | null>(null);
  const [saveChecked, setSaveChecked] = useState(!persistGame);
  const [scoreState, setScoreState] = useState<ScoreState>(() => createInitialScoreState());
  const {
    muted: audioMuted,
    pauseMusic,
    playChooseSound,
    playMatchSound,
    resumeMusic,
    setMuted: setAudioMuted,
    startMusic,
  } = useSiteAudio();

  const activeTiles = state.tiles.filter((tile) => !tile.removed);
  const availablePairs = useMemo(() => findAvailablePairs(state.tiles), [state.tiles]);
  const removedCount = state.tiles.length - activeTiles.length;
  const progress = Math.round((removedCount / state.tiles.length) * 100);
  const canUndo = state.removedPairs.length > 0;
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
      difficulty: (overrides?.difficulty ?? difficulty) as SavedGameDifficulty,
      tiles: nextState.tiles,
      removedTileIds: nextState.tiles.filter((tile) => tile.removed).map((tile) => tile.id),
      selectedTileId: nextState.selectedTileId,
      score: nextScoreState.score,
      comboMultiplier: nextScoreState.combo,
      elapsedSeconds: overrides?.elapsedSeconds ?? elapsedSeconds,
      moves: nextScoreState.history,
      undoStack: nextScoreState.history,
      hintsUsed: overrides?.hintsUsed ?? hintsUsed,
      shufflesUsed: 0,
      isPaused: overrides?.isPaused ?? isPaused,
    }),
    [difficulty, elapsedSeconds, hintsUsed, isPaused, scoreState, state],
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
          shufflesUsed: 0,
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
    state.removedPairs.length,
    state.status,
    userId,
  ]);

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

  function handleSelect(tileId: string) {
    if (isPaused) {
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
    }

    setState(nextState);
  }

  function handleHint() {
    if (isPaused) {
      return;
    }

    startMusic();
    const pair = state.hintPair ?? availablePairs[0];

    if (!pair) {
      return;
    }

    setHighlightedHint([pair.firstId, pair.secondId]);
    setHintsUsed((current) => current + 1);
    window.setTimeout(() => setHighlightedHint([]), 1800);
  }

  function handleRestart() {
    startMusic();
    setHighlightedHint([]);
    setCoachOpen(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setScoreState(createInitialScoreState());
    const nextState = createInitialBoardState();
    completedSavedRef.current = false;
    setState(nextState);

    if (userId) {
      void clearCurrentGame(userId).catch((error) => {
        console.warn("Failed to clear current Zen Mahjong save:", error);
        showSaveWarning();
      });
    }
  }

  function handleUndo() {
    if (isPaused) {
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
  }

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    startMusic();
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
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    queueSave(createSaveInput(state, scoreState, { isPaused: nextPaused }));
  }

  function toggleAudio() {
    setAudioMuted((current) => {
      if (!current) {
        pauseMusic();
      }

      return !current;
    });
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
    setState(nextState);
    setDifficulty(pendingSave.difficulty);
    setScoreState(nextScoreState);
    setElapsedSeconds(pendingSave.elapsedSeconds);
    setHintsUsed(pendingSave.hintsUsed);
    setHighlightedHint([]);
    setCoachOpen(false);
    setPendingSave(null);
    setIsPaused(false);
    queueSave(createSaveInput(nextState, nextScoreState, {
      difficulty: pendingSave.difficulty,
      elapsedSeconds: pendingSave.elapsedSeconds,
      hintsUsed: pendingSave.hintsUsed,
      isPaused: false,
    }));
  }

  function handleStartFreshFromSave() {
    const nextState = createInitialBoardState();
    const nextScoreState = createInitialScoreState();

    completedSavedRef.current = false;
    setState(nextState);
    setDifficulty("easy");
    setScoreState(nextScoreState);
    setElapsedSeconds(0);
    setHintsUsed(0);
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
          <div className="flex rounded-lg border border-primary/20 bg-popover/70 p-1">
            {difficulties.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDifficultyChange(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm",
                  difficulty === item.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,107,53,0.35)]"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={togglePause}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/20 bg-card/85 px-3 py-2 text-sm font-bold transition hover:border-primary/45 hover:bg-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl border border-primary/10 bg-black/20 p-2 sm:p-3">
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
                      paused={isPaused}
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
        </div>
        <GameActionDock
          availablePairsCount={availablePairs.length}
          canUndo={canUndo}
          coachOpen={coachOpen}
          hintHidden={difficulty === "hard"}
          isFullscreen={isFullscreen}
          paused={isPaused}
          audioMuted={audioMuted}
          onAudioToggle={toggleAudio}
          onCoachToggle={() => setCoachOpen((current) => !current)}
          onFullscreenToggle={toggleFullscreen}
          onHint={handleHint}
          onRestart={handleRestart}
          onUndo={handleUndo}
          removedPairsCount={state.removedPairs.length}
        />
      </div>

      <div className="relative z-10 mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="text-primary">
            {removedCount}/144 собрано · {state.status === "won" ? "Победа" : state.status === "no-moves" ? "Нет ходов" : `Пар: ${availablePairs.length}`}
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
      </AnimatePresence>
    </div>
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
  audioMuted,
  onAudioToggle,
  onCoachToggle,
  onFullscreenToggle,
  onHint,
  onRestart,
  onUndo,
  removedPairsCount,
}: {
  availablePairsCount: number;
  canUndo: boolean;
  coachOpen: boolean;
  hintHidden: boolean;
  isFullscreen: boolean;
  paused: boolean;
  audioMuted: boolean;
  onAudioToggle: () => void;
  onCoachToggle: () => void;
  onFullscreenToggle: () => void;
  onHint: () => void;
  onRestart: () => void;
  onUndo: () => void;
  removedPairsCount: number;
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
        <GameActionButton
          label="Отмена"
          icon={<RotateCcw />}
          onClick={onUndo}
          disabled={paused || !canUndo}
          className="lg:min-h-24"
        />
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
        <GameActionButton
          label={audioMuted ? "Звук: выкл" : "Звук: вкл"}
          icon={audioMuted ? <VolumeX /> : <Volume2 />}
          onClick={onAudioToggle}
          active={!audioMuted}
          className="lg:min-h-20"
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
      <button
        type="button"
        onClick={onRestart}
        disabled={paused}
        className="rounded-lg border border-primary/15 bg-popover/70 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Заново
      </button>
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
