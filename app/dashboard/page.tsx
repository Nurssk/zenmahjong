import Link from "next/link";
import { Crown, Flame, Play, ShoppingBag, Target, TrendingUp, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { QuestCard } from "@/components/dashboard/quest-card";
import { GameSaveSummary } from "@/components/dashboard/game-save-summary";
import { DailyTournamentCard } from "@/components/dashboard/daily-tournament-card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppShell activePath="/dashboard">
        <MotionShell>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-8">
          <section>
            <h1 className="type-heading-lg mb-1 text-zen-gradient">С возвращением, воин</h1>
            <p className="text-sm text-muted-foreground md:type-body-lg">Продолжи путь к мастерству.</p>
          </section>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
              <Button asChild size="xl" className="h-auto justify-between rounded-xl p-4 text-left sm:p-6 md:p-8">
                <Link href="/game" className="w-full">
                  <span className="flex items-center gap-4 md:gap-6">
                    <span className="grid size-12 place-items-center rounded-full bg-black/20 md:size-16">
                      <Play className="size-6 md:size-8" fill="currentColor" />
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-black uppercase tracking-[0.045em] md:text-3xl">Играть</span>
                      <span className="block text-sm font-semibold text-primary-foreground/70">Новая партия</span>
                    </span>
                  </span>
                  <Zap className="size-9 opacity-50 md:size-12" />
                </Link>
              </Button>

              <div className="grid gap-4">
                <DailyTournamentCard />
              </div>

              <GameSaveSummary />

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="text-primary" />
                    Ежедневные задания
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">3/5 выполнено</span>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <QuestCard title="Победи в 3 партиях" progress={2} target={3} reward="+100" />
                  <QuestCard title="Заверши партию быстрее 5 минут" progress={1} target={1} reward="+150" completed />
                  <QuestCard title="Не используй подсказки" progress={0} target={1} reward="+200" />
                </CardContent>
              </Card>
            </div>

            <aside className="flex flex-col gap-4 lg:gap-6">
              <Link href="/battle-pass" className="group relative overflow-hidden rounded-xl border border-purple-energy/30 bg-gradient-to-br from-popover to-background-mid p-4 transition-all hover:border-purple-energy/60 md:p-6">
                <div className="absolute right-0 top-0 size-32 rounded-full bg-purple-energy/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-purple-300">
                    <Crown />
                    Zen Pass
                  </div>
                  <h2 className="mb-2 font-display text-2xl font-black uppercase tracking-[0.02em] text-purple-100 md:type-heading-lg">Сезон 1: Воины тени</h2>
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>Уровень 8</span>
                    <span>2,450 / 3,000 XP</span>
                  </div>
                  <Progress value={82} />
                  <p className="mt-2 text-xs text-purple-300">Осталось 23 дня</p>
                </div>
              </Link>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-primary" />
                    Твоя статистика
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <StatBox label="Победы" value="68%" />
                  <StatBox label="Серия" value="5" icon={<Flame className="text-orange-glow" />} />
                  <StatBox label="Партии" value="234" />
                  <StatBox label="Ранг" value="#142" />
                </CardContent>
              </Card>

              <Link href="/shop" className="rounded-xl border border-primary/30 bg-gradient-to-br from-secondary to-card p-4 text-left transition-all hover:border-primary/60 md:p-6">
                <div className="mb-2 flex items-center gap-3">
                  <ShoppingBag className="text-primary" />
                  <h2 className="font-bold">Магазин</h2>
                </div>
                <p className="text-sm text-muted-foreground">Доступны новые наборы тренеров.</p>
              </Link>
            </aside>
          </div>
        </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-popover p-3">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-xl font-bold">{value}</p>
        {icon}
      </div>
    </div>
  );
}
