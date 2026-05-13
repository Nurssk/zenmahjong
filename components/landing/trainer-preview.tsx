import { CoachPortrait } from "@/components/coach/coach-portrait";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trainers } from "@/constants/product";

export function TrainerPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {trainers.map((trainer) => (
        <Card key={trainer.id}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-4">
              <CoachPortrait trainerId={trainer.id} />
              <div>
                <h3 className="text-lg font-bold">{trainer.name}</h3>
                <p className="text-sm text-muted-foreground">{trainer.title}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">“{trainer.quote}”</p>
            <Badge variant="muted" className="w-fit">
              {trainer.unlock}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
