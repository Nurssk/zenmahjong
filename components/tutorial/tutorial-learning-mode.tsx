"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Lightbulb, Lock, Play, RotateCcw, Star } from "lucide-react";
import { AiroCoach } from "@/components/tutorial/airo-coach";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";
import { AUDIO_ASSET_FALLBACKS } from "@/src/lib/audio/audio-assets";
import {
  applyTutorialHint,
  createTutorialState,
  getVisibleTutorialTiles,
  isTutorialTileFree,
  selectTutorialTile,
  undoTutorialMove,
} from "@/src/lib/tutorial/tutorial-engine";
import { saveTutorialCompletion } from "@/src/lib/tutorial/tutorial-progress";
import { playTutorialSfx } from "@/src/lib/tutorial/tutorial-sfx";
import { tutorialSteps } from "@/src/lib/tutorial/tutorial-steps";
import type { AiroMood } from "@/src/lib/tutorial/airo-assets";
import type { TutorialState, TutorialStep, TutorialTile } from "@/src/lib/tutorial/tutorial-types";

const AUTO_ADVANCE_STEP_IDS = new Set(["first_match", "same_tiles", "blocked_tiles", "one_side_open", "two_layers", "hint", "undo"]);
const HINT_STEP_CLICK_MESSAGE = "Сначала попробуй кнопку «Подсказка». Сейчас мы учимся пользоваться ей.";

export function TutorialLearningMode() {
  const router = useRouter();
  const { user } = useAuth();
  const { soundEnabled } = useSoundPreference();
  const [stepIndex, setStepIndex] = useState(0);
  const step = tutorialSteps[stepIndex];
  const [state, setState] = useState<TutorialState>(() => createTutorialState(step));
  const stateRef = useRef(state);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completionOpen, setCompletionOpen] = useState(false);
  const completionSavedRef = useRef(false);
  const autoAdvanceRef = useRef<number | null>(null);
  const completionRedirectRef = useRef<number | null>(null);
  const progress = Math.round(((stepIndex + (state.completed ? 1 : 0)) / tutorialSteps.length) * 100);
  const isMiniChallenge = step.id === "mini_challenge";
  const isHintTileClickLocked = step.goal === "use_hint" && !state.completed;
  const canGoNext = state.completed && stepIndex < tutorialSteps.length - 1;
  const coachMood: AiroMood = state.messageType === "success" ? "win" : state.messageType === "warning" ? "lose" : step.airoMood;
  const coachMessage = state.messageType === "neutral" ? step.airoMessage : state.message;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const goToStep = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, tutorialSteps.length - 1));
    const nextStep = tutorialSteps[boundedIndex];

    const nextState = createTutorialState(nextStep);

    setStepIndex(boundedIndex);
    stateRef.current = nextState;
    setState(nextState);
    setElapsedSeconds(0);
    completionSavedRef.current = false;
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isMiniChallenge || state.completed) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isMiniChallenge, state.completed]);

  useEffect(() => {
    if (!state.completed || isMiniChallenge || !AUTO_ADVANCE_STEP_IDS.has(step.id) || stepIndex >= tutorialSteps.length - 1) {
      return undefined;
    }

    autoAdvanceRef.current = window.setTimeout(() => {
      goToStep(stepIndex + 1);
      autoAdvanceRef.current = null;
    }, 650);

    return () => {
      if (autoAdvanceRef.current) {
        window.clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };
  }, [goToStep, isMiniChallenge, state.completed, step.id, stepIndex]);

  useEffect(() => {
    if (state.messageType !== "warning") {
      return undefined;
    }

    const feedbackId = window.setTimeout(() => {
      setState((current) =>
        current.messageType === "warning"
          ? {
              ...current,
              message: step.airoMessage,
              messageType: "neutral",
            }
          : current,
      );
    }, 1400);

    return () => window.clearTimeout(feedbackId);
  }, [state.messageType, step.airoMessage]);

  useEffect(() => {
    if (!isMiniChallenge || !state.completed || completionSavedRef.current) {
      return;
    }

    completionSavedRef.current = true;
    setCompletionOpen(true);

    void saveTutorialCompletion(user?.uid, step.id)
      .catch(() => {
        // Completion is best-effort; the tutorial should never crash if Firebase is unavailable.
      })
      .finally(() => {
        completionRedirectRef.current = window.setTimeout(() => {
          router.replace("/dashboard");
        }, 1600);
      });

    return () => {
      if (completionRedirectRef.current) {
        window.clearTimeout(completionRedirectRef.current);
        completionRedirectRef.current = null;
      }
    };
  }, [isMiniChallenge, router, state.completed, step.id, user?.uid]);

  function handleTileClick(tileId: string) {
    if (step.goal === "use_hint" && !state.completed) {
      const nextState = {
        ...stateRef.current,
        highlightedTileIds: [],
        message: step.errorMessage ?? HINT_STEP_CLICK_MESSAGE,
        messageType: "warning",
        selectedTileId: null,
        tiles: stateRef.current.tiles.map((tile) => ({ ...tile, selected: false })),
      } satisfies TutorialState;

      stateRef.current = nextState;
      setState(nextState);
      return;
    }

    const currentState = stateRef.current;
    const tile = currentState.tiles.find((candidate) => candidate.id === tileId);

    if (!tile || tile.removed || !isTutorialTileFree(tile, currentState.tiles)) {
      const nextState = selectTutorialTile(currentState, step, tileId);

      stateRef.current = nextState;
      setState(nextState);
      return;
    }

    playTutorialSfx(AUDIO_ASSET_FALLBACKS.choose, soundEnabled);
    const nextState = selectTutorialTile(currentState, step, tileId);
    const removedBefore = currentState.tiles.filter((candidate) => candidate.removed).length;
    const removedAfter = nextState.tiles.filter((candidate) => candidate.removed).length;

    if (removedAfter > removedBefore) {
      playTutorialSfx(AUDIO_ASSET_FALLBACKS.match, soundEnabled, 0.58);
    }

    stateRef.current = nextState;
    setState(nextState);
  }

  function handleHint() {
    const currentState = stateRef.current;
    const nextState = currentState.completed
      ? currentState
      : applyTutorialHint(
          {
            ...currentState,
            selectedTileId: null,
            tiles: currentState.tiles.map((tile) => ({ ...tile, selected: false })),
          },
          step,
        );

    stateRef.current = nextState;
    setState(nextState);
  }

  function handleUndo() {
    const nextState = undoTutorialMove(stateRef.current, step);

    stateRef.current = nextState;
    setState(nextState);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 md:gap-8">
      <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-background-mid to-[#140812] p-4 shadow-glass md:rounded-2xl md:p-7">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <Badge variant="secondary" className="rounded-lg border border-primary/25 bg-popover/90 text-primary">
              Обучение
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-[0.04em] md:text-6xl">Zen Mahjong</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Короткий интерактивный режим без полной доски: изучите пары, блокировки, слои, подсказки и отмены.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-popover/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                Шаг {stepIndex + 1} из {tutorialSteps.length}
              </p>
              <p className="text-xs font-bold text-muted-foreground">{progress}%</p>
            </div>
            <Progress className="mt-3" value={progress} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <AiroCoach mood={coachMood} message={coachMessage} />
          <InstructionPanel step={step} state={state} />
          <StepList activeIndex={stepIndex} />
        </aside>

        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/75 p-3 shadow-glass backdrop-blur-xl md:p-5">
          <div className="absolute inset-0 bg-zen-radial" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Metric icon={<Star className="size-4" />} label="Очки" value={state.score.toLocaleString("ru-RU")} />
                {isMiniChallenge ? <Metric icon={<Clock3 className="size-4" />} label="Время" value={formatTime(elapsedSeconds)} /> : null}
              </div>
              <div className="text-xs font-bold text-muted-foreground">Учебная доска: {state.tiles.length} плиток</div>
            </div>

            <TutorialBoard
              highlightedTileIds={state.highlightedTileIds}
              tileClicksDisabled={isHintTileClickLocked}
              step={step}
              tiles={state.tiles}
              onTileClick={handleTileClick}
            />

            <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <Button variant="outline" disabled={stepIndex === 0} onClick={() => goToStep(stepIndex - 1)}>
                <ArrowLeft className="size-4" />
                Назад
              </Button>

              <div className="flex flex-wrap justify-center gap-2">
                {step.id === "hint" ? (
                  <Button variant="premium" disabled={state.completed} onClick={handleHint}>
                    <Lightbulb className="size-4" />
                    Подсказка
                  </Button>
                ) : null}
                {step.id === "undo" ? (
                  <Button variant="premium" disabled={state.history.length === 0 && !state.completed} onClick={handleUndo}>
                    <RotateCcw className="size-4" />
                    Отмена
                  </Button>
                ) : null}
              </div>

              {stepIndex < tutorialSteps.length - 1 ? (
                <Button disabled={!canGoNext} onClick={() => goToStep(stepIndex + 1)}>
                  Далее
                  <ArrowRight className="size-4" />
                </Button>
              ) : state.completed ? (
                <Button asChild>
                  <Link href="/game">
                    Начать игру
                    <Play className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled>
                  Начать игру
                  <Play className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <CompletionModal
        message={tutorialSteps.at(-1)?.successMessage ?? "Отлично! Обучение завершено. Теперь ты готов к настоящей партии."}
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
      />
    </div>
  );
}

function InstructionPanel({ state, step }: { state: TutorialState; step: TutorialStep }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-card/82 p-4 shadow-glass backdrop-blur-xl md:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{step.description}</p>
      <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.04em] text-foreground">{step.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.instruction}</p>
      <div
        className={cn(
          "mt-4 rounded-xl border p-3 text-sm font-semibold leading-6",
          state.messageType === "success" ? "border-green-success/30 bg-green-success/10 text-green-success" : null,
          state.messageType === "warning" ? "border-primary/35 bg-primary/10 text-primary" : null,
          state.messageType === "neutral" ? "border-purple-energy/25 bg-purple-energy/10 text-foreground" : null,
        )}
      >
        {state.message}
      </div>
      <p className="mt-3 text-xs font-semibold text-muted-foreground">
        Учебные подсказки и отмены бесплатные. Реальные балансы игрока здесь не расходуются.
      </p>
    </div>
  );
}

function StepList({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-primary/10 bg-popover/35 p-2 backdrop-blur-xl lg:grid-cols-1">
      {tutorialSteps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] font-bold leading-tight sm:text-xs",
            index === activeIndex ? "border-primary/45 bg-primary/10 text-primary opacity-100" : "border-white/5 bg-white/[0.025] text-muted-foreground opacity-55",
            index < activeIndex ? "text-green-success opacity-75" : null,
          )}
        >
          {index < activeIndex ? (
            <CheckCircle2 className="size-3.5 shrink-0" />
          ) : (
            <span className="grid size-4 shrink-0 place-items-center rounded bg-white/5 text-[10px]">{index + 1}</span>
          )}
          <span className="truncate">{step.title}</span>
        </div>
      ))}
    </div>
  );
}

function TutorialBoard({
  highlightedTileIds,
  onTileClick,
  step,
  tileClicksDisabled,
  tiles,
}: {
  highlightedTileIds: string[];
  onTileClick: (tileId: string) => void;
  step: TutorialStep;
  tileClicksDisabled?: boolean;
  tiles: TutorialTile[];
}) {
  const visibleTiles = useMemo(() => getVisibleTutorialTiles(tiles), [tiles]);
  const boardMetrics = useMemo(() => {
    const maxX = Math.max(...tiles.map((tile) => tile.x), 0);
    const maxY = Math.max(...tiles.map((tile) => tile.y), 0);
    const maxZ = Math.max(...tiles.map((tile) => tile.z), 0);
    return { maxX, maxY, maxZ };
  }, [tiles]);
  const boardStyle = {
    "--tutorial-max-x": boardMetrics.maxX,
    "--tutorial-max-y": boardMetrics.maxY,
    "--tutorial-max-z": boardMetrics.maxZ,
  } as CSSProperties;

  return (
    <div className="grid min-h-[300px] place-items-center overflow-hidden rounded-xl border border-primary/15 bg-black/25 p-3 md:min-h-[420px] md:p-5">
      <div
        className="relative max-w-full [--tile-h:calc(var(--tile-w)*1.28)] [--tile-step-x:calc(var(--tile-w)*0.82)] [--tile-step-y:calc(var(--tile-h)*0.78)] [--tile-w:clamp(48px,8vw,78px)]"
        style={{
          ...boardStyle,
          width: "calc((var(--tile-step-x) * var(--tutorial-max-x)) + var(--tile-w) + 48px)",
          height: "calc((var(--tile-step-y) * var(--tutorial-max-y)) + var(--tile-h) + (var(--tutorial-max-z) * 14px) + 36px)",
        }}
      >
        <AnimatePresence>
          {visibleTiles.map((tile) => (
            <TutorialTileButton
              key={tile.id}
              highlighted={highlightedTileIds.includes(tile.id) || Boolean(tile.highlighted)}
              interactionsDisabled={tileClicksDisabled}
              isFree={isTutorialTileFree(tile, tiles)}
              step={step}
              tile={tile}
              onClick={() => onTileClick(tile.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TutorialTileButton({
  highlighted,
  interactionsDisabled,
  isFree,
  onClick,
  step,
  tile,
}: {
  highlighted: boolean;
  interactionsDisabled?: boolean;
  isFree: boolean;
  onClick: () => void;
  step: TutorialStep;
  tile: TutorialTile;
}) {
  const shouldTeachAvailability = step.id === "blocked_tiles" || step.id === "one_side_open" || step.id === "two_layers";
  const tileStyle = {
    left: `calc((var(--tile-step-x) * ${tile.x}) + (${tile.z} * 12px))`,
    top: `calc((var(--tile-step-y) * ${tile.y}) - (${tile.z} * 14px) + 18px)`,
    zIndex: tile.z * 10 + tile.y + 1,
  };

  return (
    <motion.button
      type="button"
      className={cn(
        "absolute grid place-items-center rounded-xl border bg-[#f3ead5] text-[#2c2118] shadow-[0_10px_0_#c9b78d,0_18px_32px_rgba(0,0,0,0.35)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "h-[var(--tile-h)] w-[var(--tile-w)]",
        tile.selected ? "border-primary ring-2 ring-primary" : "border-[#d8c49b]",
        highlighted && isFree ? "ring-2 ring-purple-energy shadow-[0_10px_0_#c9b78d,0_0_28px_rgba(108,99,255,0.42)]" : null,
        shouldTeachAvailability && isFree ? "after:absolute after:-inset-1 after:rounded-[inherit] after:border after:border-green-success/50" : null,
        !isFree ? "opacity-55 grayscale" : "hover:-translate-y-1",
        interactionsDisabled ? "cursor-not-allowed opacity-70 hover:translate-y-0" : null,
      )}
      style={tileStyle}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -8 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
    >
      {!isFree ? (
        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-md bg-black/55 text-white">
          <Lock className="size-3" />
        </span>
      ) : null}
      {tile.image ? (
        <Image src={tile.image} alt={tile.label} width={42} height={42} className="size-8 object-contain md:size-10" />
      ) : null}
      <span className="mt-1 max-w-[90%] truncate text-[10px] font-black uppercase leading-none md:text-xs">{tile.label}</span>
    </motion.button>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-popover/75 px-3 py-2 text-sm font-bold">
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CompletionModal({ message, onClose, open }: { message: string; onClose: () => void; open: boolean }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-primary/35 bg-[#101014]/95 p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.72)]"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
          >
            <AiroCoach mood="win" message={message} title="Айро" variant="compact" />
            <h2 className="mt-5 font-display text-4xl font-black uppercase tracking-[0.04em]">Обучение завершено</h2>
            <p className="mt-3 text-muted-foreground">Теперь вы готовы к настоящей партии.</p>
            <p className="mt-2 text-sm font-semibold text-green-success">Вы освоили основные правила Zen Mahjong.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={onClose}>
                Остаться
              </Button>
              <Button asChild>
                <Link href="/game">
                  Начать игру
                  <Play className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}
