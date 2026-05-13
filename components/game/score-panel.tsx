import { Progress } from "@/components/ui/progress";
import { GlassPanel } from "@/components/layout/glass-panel";

export function ScorePanel() {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between">
        <div>
        <p className="text-sm text-muted-foreground">Комбо</p>
        <p className="text-3xl font-bold text-primary">x3</p>
      </div>
        <p className="text-right text-sm text-muted-foreground">Пульс множителя</p>
      </div>
      <Progress value={72} className="mt-5" />
    </GlassPanel>
  );
}
