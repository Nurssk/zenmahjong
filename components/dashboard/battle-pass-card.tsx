import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BattlePassCard() {
  return (
    <Card>
      <CardHeader>
        <Crown className="text-primary" />
        <CardTitle>Zen Pass</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Бесплатные награды, PRO-ветка, сезонные тренеры и эксклюзивные скины.
        </p>
        <Progress value={42} className="mt-5" />
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href="/battle-pass">Открыть путь</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
