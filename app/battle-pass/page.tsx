import { Crown, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { BattlePassTrack } from "@/components/battle-pass/battle-pass-track";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function BattlePassPage() {
  return (
    <AppShell activePath="/battle-pass">
      <MotionShell>
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Zen Pass"
            title="Сезонные награды Free и PRO"
            description="Боевой пропуск Zen Mahjong: бесплатные награды, PRO-ветка x2, самоцветы, премиальные наборы, тренеры и эксклюзивные скины."
          />
          <Card className="overflow-hidden border-primary/45 bg-card/90 shadow-premium">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Прогресс сезона</CardTitle>
                <Badge variant="premium">
                  <Crown className="size-3" />
                  PRO-превью
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="type-heading-xl text-zen-gradient">Уровень 4</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    420 XP до осколка сезонного тренера.
                  </p>
                </div>
                <Sparkles className="hidden size-12 text-primary sm:block" />
              </div>
              <Progress value={62} className="mt-5" />
            </CardContent>
          </Card>
          <BattlePassTrack />
        </div>
      </MotionShell>
    </AppShell>
  );
}
