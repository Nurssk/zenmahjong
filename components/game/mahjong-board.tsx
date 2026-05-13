"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MahjongTile } from "@/components/game/mahjong-tile";
import { cn } from "@/lib/utils";

export function MahjongBoard({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<number[]>([12, 13]);
  const tiles = Array.from({ length: compact ? 30 : 64 }, (_, index) => index);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-background-mid p-4 shadow-glass md:p-8",
        compact ? "min-h-[360px]" : "min-h-[520px]",
      )}
    >
      <div className="absolute inset-0 bg-zen-radial" />
      <div className="relative flex min-h-[inherit] items-center justify-center pb-12">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {tiles.map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
            >
              <MahjongTile
                index={index}
                compact={compact}
                selected={selected.includes(index)}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="text-primary">20/144 собрано</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-zen-cta"
            initial={{ width: 0 }}
            animate={{ width: "14%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <button
          type="button"
          onClick={() => setSelected((current) => (current[0] === 12 ? [28, 29] : [12, 13]))}
          className="sr-only"
        >
          Показать следующую пару
        </button>
      </div>
    </div>
  );
}
