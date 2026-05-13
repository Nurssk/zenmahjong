import { Check } from "lucide-react";
import { playerLevels } from "@/constants/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LevelSelect() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {playerLevels.map((level, index) => (
        <Card key={level.id} className={index === 1 ? "border-primary/50" : undefined}>
          <CardHeader>
            <Badge variant={index === 1 ? "default" : "outline"} className="w-fit">
              {index === 1 ? "Рекомендуем" : level.name}
            </Badge>
            <CardTitle>{level.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm leading-6 text-muted-foreground">{level.description}</p>
            {level.perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-sm">
                <Check className="text-primary" />
                {perk}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
