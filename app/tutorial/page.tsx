import { CheckCircle2, Play } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MahjongBoard } from "@/components/game/mahjong-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tutorialSteps } from "@/constants/product";

export default function TutorialPage() {
  return (
    <AppShell activePath="/tutorial">
      <MotionShell>
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col gap-6">
            <PageHeader
              eyebrow="Путь новичка"
              title="Обучение"
              description="11 шагов к первой победе: пары, свободные кости, таймер, очки, подсказки, отмена и самостоятельное завершение."
            />
            <div className="grid gap-3">
              {tutorialSteps.map((step, index) => (
                <Card
                  key={step}
                  className={index === 2 ? "border-primary/45 bg-primary/10 shadow-ember" : "bg-card/80"}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {index < 2 ? (
                      <CheckCircle2 className="size-8 text-green-success" />
                    ) : (
                      <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-sm font-black text-primary">
                        {index + 1}
                      </span>
                    )}
                    <span className="font-semibold">{step}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button asChild size="xl">
              <Link href="/dashboard">
                <Play className="size-5" />
                Завершить обучение
              </Link>
            </Button>
          </div>
          <MahjongBoard compact />
        </div>
      </MotionShell>
    </AppShell>
  );
}
