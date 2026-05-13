import { CoachPortrait } from "@/components/coach/coach-portrait";
import { trainers } from "@/constants/product";
import { Card, CardContent } from "@/components/ui/card";

export function TrainerSelect() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {trainers.map((trainer) => (
        <Card key={trainer.id} className={trainer.id === "airo" ? "border-primary/50" : undefined}>
          <CardContent className="flex flex-col gap-4 p-5">
            <CoachPortrait trainerId={trainer.id} size="lg" />
            <div>
              <h3 className="text-xl font-black">{trainer.name}</h3>
              <p className="text-sm text-muted-foreground">{trainer.title}</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{trainer.tone}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
