import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function QuestCard({
  title,
  progress,
  target,
  reward,
  completed,
}: {
  title: string;
  progress: number;
  target: number;
  reward: string;
  completed?: boolean;
}) {
  const percent = Math.min(100, (progress / target) * 100);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-popover p-3">
      <div className="min-w-0 flex-1">
        <p className={cn("mb-2 text-sm font-medium", completed && "text-muted-foreground line-through")}>
          {title}
        </p>
        <Progress value={percent} className="h-1.5" />
      </div>
      <div className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-bold text-gold">
        {reward}
      </div>
    </div>
  );
}
