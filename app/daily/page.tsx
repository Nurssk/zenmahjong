import { Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DailyPage() {
  return (
    <ProtectedRoute>
      <AppShell activePath="/leaderboard">
        <MotionShell>
          <div className="flex flex-col gap-8">
            <PageHeader
              eyebrow="Ежедневный турнир"
              title="Сид дня"
              description="Защищенная турнирная зона. Полная игровая логика появится позже, текущий демо-расклад остается стабильным."
            />
            <Card className="border-primary/25 bg-card/90 shadow-premium">
              <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Trophy />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-black uppercase tracking-[0.04em] text-zen-gradient">
                      Турнир открыт
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Один расклад. Один день. Одна таблица.</p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/game">Играть</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}
