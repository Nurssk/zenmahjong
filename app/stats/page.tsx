import { Clock3, Flame, Trophy, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { PerformanceChart } from "@/components/stats/performance-chart";
import { demoStats } from "@/constants/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StatsPage() {
  const stats = [
    ["Процент побед", `${demoStats.winRate}%`, "Победы от всех завершенных партий"],
    ["Текущая серия", `${demoStats.currentStreak}`, "Активная серия побед"],
    ["Лучшая серия", `${demoStats.longestStreak}`, "Рекордная серия за все время"],
    ["Сыграно партий", `${demoStats.gamesPlayed}`, "Все отслеживаемые сессии"],
    ["Лучшее время", demoStats.bestTime, "Самый быстрый турнирный расклад"],
    ["Всего побед", `${demoStats.totalWins}`, "Завершенные победы"],
    ["Победы в турнирах", `${demoStats.dailyTournamentWins}`, "Победы в ежедневном сиде"],
    ["Общий счет", demoStats.totalScore.toLocaleString(), "Очки за все время"],
  ];

  return (
    <AppShell activePath="/stats">
      <MotionShell>
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Статистика"
            title="Личная статистика Zen Mahjong"
            description="Профиль мастерства: победы, серии, лучшее время, турниры и общий счет."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.slice(0, 4).map(([label, value, detail], index) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                detail={detail}
                icon={[TrendingUp, Flame, Trophy, Clock3][index]}
              />
            ))}
          </div>
          <PerformanceChart />
          <Card className="border-primary/15 bg-card/80 shadow-premium">
            <CardHeader>
              <CardTitle>Состояние прогресса</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold">Ежедневная стабильность</p>
                <Progress value={78} className="mt-3" />
              </div>
              <div>
                <p className="text-sm font-semibold">Турнирная форма</p>
                <Progress value={64} className="mt-3" />
              </div>
              <div>
                <p className="text-sm font-semibold">Мастерство тренера</p>
                <Progress value={52} className="mt-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MotionShell>
    </AppShell>
  );
}
