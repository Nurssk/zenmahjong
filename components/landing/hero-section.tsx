"use client";

import Link from "next/link";
import { ArrowRight, Brain, Coins, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AtmosphericBackground } from "@/components/layout/atmospheric-background";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/layout/glass-panel";
import { productName } from "@/constants/product";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-zen-page">
      <AtmosphericBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative mb-6 inline-block">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <h1 className="type-display-xl relative bg-zen-title bg-clip-text text-transparent">
              {productName}
            </h1>
          </div>
          <p className="type-body-lg mx-auto max-w-lg text-muted-foreground">
            Овладей древней стратегией в легендарной арене головоломок.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Button asChild size="xl" className="group relative">
            <Link href="/login">
              <Sparkles data-icon="inline-start" />
              Начать игру
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ["Ежедневные турниры", "Сражайся за легендарные награды", Sparkles],
            ["Сенсеи", "Тренируйся с мистическими наставниками", Brain],
            ["Игровая экономика", "Покупай подсказки, отмены и косметические наборы", Coins],
          ].map(([title, description, Icon], index) => (
            <motion.div
              key={String(title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <GlassPanel className="group relative overflow-hidden p-6 text-left transition-all hover:border-primary/40">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <Icon className="mb-4 text-primary" />
                  <h3 className="mb-2 font-display text-xl font-black uppercase tracking-[0.025em]">{String(title)}</h3>
                  <p className="type-body text-muted-foreground">{String(description)}</p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <Button asChild variant="outline">
            <Link href="/login">Войти</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Создать аккаунт</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
