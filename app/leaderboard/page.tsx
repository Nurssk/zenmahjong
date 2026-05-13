import { Crown, Flame, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardTabs } from "@/components/leaderboard/leaderboard-tabs";
import { StatCard } from "@/components/layout/stat-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sorts = [
  "Ежедневный турнир",
  "Очки за все время",
  "Лучшее время",
  "Серия побед",
  "Всего побед",
  "Уровень Zen Pass",
];

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <AppShell activePath="/leaderboard">
        <MotionShell>
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Турнир"
            title="Ежедневный турнир"
            description="Живой рейтинг сегодняшнего сида Zen Mahjong: мир, Казахстан, города и друзья."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Призовой фонд" value="5,000" detail="монет для лидеров" icon={Trophy} />
            <StatCard label="Твой ранг" value="#2" detail="лига Павлодара" icon={Crown} />
            <StatCard label="Игроки" value="1,247" detail="сегодня в бою" icon={Users} />
            <StatCard label="Серия" value="14" detail="побед подряд" icon={Flame} />
          </div>
          <div className="rounded-2xl border border-primary/25 bg-zen-cta p-6 shadow-ember-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge variant="live">Идет сейчас</Badge>
                <h2 className="type-heading-xl mt-4 text-background">
                  Заверши до полуночи, чтобы закрепить награду дня.
                </h2>
              </div>
              <div className="rounded-xl bg-background/90 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Осталось</p>
                <p className="text-2xl font-black text-primary">06:42:11</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/15 bg-card/70 p-4">
            <LeaderboardTabs />
            <Tabs defaultValue={sorts[0]}>
              <TabsList className="flex h-auto flex-wrap justify-start">
                {sorts.map((sort) => (
                  <TabsTrigger key={sort} value={sort}>
                    {sort}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <LeaderboardTable />
        </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}
