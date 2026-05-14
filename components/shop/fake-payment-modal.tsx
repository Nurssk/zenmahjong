"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins, Gem, Gift, X } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DemoPaymentShopItem } from "@/src/lib/economy/economy-service";

const numberFormatter = new Intl.NumberFormat("ru-RU");

export function FakePaymentModal({
  loading = false,
  onClose,
  onConfirm,
  pack,
}: {
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pack: DemoPaymentShopItem | null;
}) {
  const rewardAmount = pack?.type === "gems" ? pack.gems : pack?.coins;
  const rewardLabel = pack?.type === "gems" ? "Самоцветы" : "Монеты";
  const RewardIcon = pack?.type === "gems" ? Gem : Coins;

  return (
    <AnimatePresence>
      {pack ? (
        <motion.div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/35 bg-[#101014]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.72),0_0_60px_rgba(255,107,53,0.16)] md:p-6"
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <button
              aria-label="Закрыть"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              disabled={loading}
              type="button"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>

            <div className="pr-10">
              <Badge variant="premium" className="rounded-lg">
                Демо
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-[0.04em] text-foreground md:text-4xl">
                Демо-оплата
              </h2>
              <p className="mt-4 text-lg font-black text-primary">Оплата появится позже. Пока держите подарок!</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Это демо-режим: валюта будет начислена без реальной оплаты.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-primary/20 bg-black/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Выбранный набор</p>
                  <p className="mt-2 font-display text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {pack.title}
                  </p>
                </div>
                <div className="grid size-14 place-items-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
                  <Gift className="size-7" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <PackMetric
                  icon={<RewardIcon className="size-4" fill="currentColor" />}
                  label={rewardLabel}
                  premium={pack.type === "gems"}
                  value={`+${numberFormatter.format(rewardAmount ?? 0)}`}
                />
                <PackMetric label="Цена" value={`${numberFormatter.format(pack.priceKzt)} ₸`} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button className="sm:order-2" disabled={loading} onClick={onConfirm}>
                {loading ? "Начисляем..." : "Получить подарок"}
              </Button>
              <Button className="sm:order-1" disabled={loading} variant="outline" onClick={onClose}>
                Отмена
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PackMetric({
  icon,
  label,
  premium = false,
  value,
}: {
  icon?: ReactNode;
  label: string;
  premium?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 flex items-center gap-2 font-display text-xl font-black text-foreground",
          icon && !premium ? "text-gold" : null,
          icon && premium ? "text-purple-energy" : null,
        )}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}
