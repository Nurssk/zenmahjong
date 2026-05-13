import { CoachPortrait } from "@/components/coach/coach-portrait";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TrainerId } from "@/types";

export function TrainerCard({
  trainerId,
  price,
}: {
  trainerId: TrainerId;
  price: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <CoachPortrait trainerId={trainerId} size="lg" />
        <div>
          <h3 className="font-bold capitalize">{trainerId}</h3>
          <p className="text-sm text-muted-foreground">Премиальная личность AI-тренера.</p>
        </div>
        <Button variant="outline">{price}</Button>
      </CardContent>
    </Card>
  );
}
