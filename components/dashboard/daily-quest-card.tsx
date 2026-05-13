import { dailyQuests } from "@/constants/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function DailyQuestCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ежедневные задания</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {dailyQuests.map((quest) => (
          <div key={quest.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{quest.title}</span>
              <span className="text-muted-foreground">{quest.reward}</span>
            </div>
            <Progress value={(quest.progress / quest.target) * 100} className="mt-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
