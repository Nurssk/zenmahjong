import { BarChart3, Bot, Gem, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Система AI-тренеров",
    description: "Airo, Vega и Blitz ведут игроков разными стилями.",
    icon: Bot,
  },
  {
    title: "Ежедневные турниры",
    description: "Один расклад, равные условия и давление мирового рейтинга.",
    icon: Trophy,
  },
  {
    title: "Петля прогресса",
    description: "Задания, серии, статистика, монеты, самоцветы и коллекционные награды.",
    icon: BarChart3,
  },
  {
    title: "Премиальная экономика",
    description: "Тренеры, скины, наборы и Zen Pass в демо-интерфейсе.",
    icon: Gem,
  },
];

export function FeatureCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <Card key={feature.title}>
            <CardHeader>
              <Icon className="text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
