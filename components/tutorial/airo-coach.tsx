"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIRO_SPRITES, type AiroMood } from "@/src/lib/tutorial/airo-assets";

type AiroCoachProps = {
  mood: AiroMood;
  message: string;
  title?: string;
  variant?: "guide" | "compact";
};

const moodStyles: Record<AiroMood, string> = {
  normal: "border-white/10 bg-white/[0.04]",
  talk: "border-purple-energy/25 bg-purple-energy/10",
  win: "border-green-success/30 bg-green-success/10",
  lose: "border-primary/35 bg-primary/10",
};

export function AiroCoach({ message, mood, title = "Айро", variant = "guide" }: AiroCoachProps) {
  const [failedMoods, setFailedMoods] = useState<Partial<Record<AiroMood, boolean>>>({});
  const [normalFailed, setNormalFailed] = useState(false);
  const shouldUseNormal = Boolean(failedMoods[mood]);
  const sprite = shouldUseNormal ? AIRO_SPRITES.normal : AIRO_SPRITES[mood];
  const showPlaceholder = normalFailed && (shouldUseNormal || mood === "normal");
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center overflow-visible",
        isCompact ? "gap-3" : "gap-4",
      )}
    >
      <motion.div
        className={cn(
          "pointer-events-none flex w-full items-end justify-center overflow-visible",
          isCompact ? "min-h-[180px]" : "min-h-[260px] lg:min-h-[520px] xl:min-h-[560px]",
        )}
        animate={{ y: mood === "win" ? -4 : 0, rotate: mood === "lose" ? -1.5 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {showPlaceholder ? (
            <motion.div
              key="airo-placeholder"
              className={cn(
                "grid place-items-center font-display font-black uppercase tracking-[0.08em] text-primary drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
                isCompact ? "h-[180px] max-h-[28vh] text-3xl" : "h-[260px] max-h-[36vh] text-5xl lg:h-[520px] lg:max-h-[75vh] xl:h-[560px]",
              )}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              Айро
            </motion.div>
          ) : (
            <motion.img
              key={sprite}
              src={sprite}
              alt={`${title}: ${mood}`}
              className={cn(
                "pointer-events-none w-auto select-none object-contain object-bottom drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
                isCompact ? "h-[180px] max-h-[28vh]" : "h-[260px] max-h-[36vh] lg:h-[520px] lg:max-h-[75vh] xl:h-[560px]",
              )}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onError={() => {
                if (shouldUseNormal || mood === "normal") {
                  setNormalFailed(true);
                } else {
                  setFailedMoods((current) => ({ ...current, [mood]: true }));
                }
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        key={`${mood}-${message}`}
        className={cn(
          "relative w-full rounded-2xl border p-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:text-left",
          "before:absolute before:left-1/2 before:top-0 before:size-3 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:border-l before:border-t before:border-current before:bg-[#16131a] lg:before:left-10",
          !isCompact ? "max-w-[340px] lg:max-w-none" : null,
          moodStyles[mood],
        )}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary lg:justify-start">
          <Sparkles className="size-3.5" />
          {title}
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-foreground md:text-base">{message}</p>
      </motion.div>
    </div>
  );
}
