"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import type { SenseiAdvice } from "@/src/lib/sensei/getSenseiAdvice";
import type { SenseiCharacter } from "@/src/lib/sensei/sensei-characters";
import { cn } from "@/lib/utils";

export function SenseiOverlay({
  advice,
  character,
  onClose,
  onNextAdvice,
}: {
  advice: SenseiAdvice;
  character: SenseiCharacter;
  onClose: () => void;
  onNextAdvice: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensei-title"
      className="absolute inset-0 z-[1320] grid place-items-center overflow-y-auto bg-black/82 p-3 backdrop-blur-xl sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-primary/35 bg-[#0E0E10]/96 p-4 text-[#F7F7F5] shadow-[0_34px_120px_rgba(0,0,0,0.78)] sm:p-6 md:p-8"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,107,53,0.18),transparent_36%),radial-gradient(circle_at_82%_22%,rgba(108,99,255,0.16),transparent_34%)]" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-foreground transition hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-4" />
        </button>

        <div className="relative grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-8">
          <div className="flex justify-center md:justify-start">
            <motion.img
              src={character.talk}
              alt={character.name}
              className="pointer-events-none h-[260px] max-h-[38vh] w-auto select-none object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,0.66)] sm:h-[340px] md:h-[520px] md:max-h-[70vh]"
              initial={{ opacity: 0, x: -18, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onError={(event) => {
                event.currentTarget.src = character.normal;
              }}
            />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div
              className={cn(
                "rounded-3xl border bg-[#0E0E10]/95 p-5 text-[#F7F7F5] shadow-[0_30px_90px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6 md:p-7",
                advice.type === "warning" ? "border-primary/55" : "border-purple-energy/45",
              )}
            >
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-orange-glow">
                <Sparkles className="size-4" />
                {character.name}
              </p>
              <h2 id="sensei-title" className="mt-3 font-display text-2xl font-black uppercase tracking-[0.04em] text-white md:text-4xl">
                {advice.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-100 md:text-lg md:leading-8">{advice.message}</p>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                Сенсей даёт стратегический совет. Это не подсказка и не расходует баланс.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onNextAdvice}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-zen-cta px-5 py-3 font-display text-sm font-black uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_28px_rgba(255,107,53,0.28)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Другой совет
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary/35 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
