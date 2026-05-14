import { CoachPortrait } from "@/components/coach/coach-portrait";
import { GlassPanel } from "@/components/layout/glass-panel";

export function CoachPanel() {
  return (
    <GlassPanel className="p-6">
      <div className="mb-4 flex gap-4">
        <CoachPortrait trainerId="airo" />
        <div>
          <p className="font-bold">Мастер Тени</p>
          <p className="text-xs text-muted-foreground">Сенсей</p>
        </div>
      </div>
      <div className="rounded-lg border border-primary/10 bg-popover p-4">
        <p className="mb-3 text-sm leading-6">
          “Сначала освободи верхние слои. Ищи пары по краям...”
        </p>
        <div className="flex gap-2">
          <button className="rounded bg-muted px-3 py-1 text-xs transition hover:bg-secondary">
            Понял
          </button>
          <button className="text-xs text-primary transition hover:text-accent">
            Еще совет
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
