import Link from "next/link";
import { Target, Trophy, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientHeading } from "@/components/layout/gradient-heading";

export function VictoryPanel() {
  const stats = [
    { label: "Время", value: "4:32", icon: Zap },
    { label: "Очки", value: "2,450", icon: Star },
    { label: "Точность", value: "94%", icon: Target },
    { label: "Ранг", value: "S", icon: Trophy },
  ];

  return (
    <Card className="relative overflow-hidden border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
      <CardContent className="relative p-8 text-center">
        <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-zen-cta shadow-ember">
          <Trophy className="size-10 text-primary-foreground" />
        </div>
        <GradientHeading as="h2" className="type-display-lg">
          Победа
        </GradientHeading>
        <p className="mt-2 text-muted-foreground">Ты подчинил этот расклад.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-primary/20 bg-popover p-4">
                <Icon className="mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/game">Еще раз</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">Главная</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
