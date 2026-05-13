import { Progress } from "@/components/ui/progress";

export function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Настройка</span>
        <span className="text-muted-foreground">Шаг {step} из 4</span>
      </div>
      <Progress value={(step / 4) * 100} />
    </div>
  );
}
