import { GlassPanel } from "@/components/layout/glass-panel";

export function PauseMenu() {
  return (
    <GlassPanel className="p-5">
      <p className="text-sm font-bold">Последние пары</p>
      <div className="mt-4 grid gap-2">
        {["🀀 🀀 +50", "🀄 🀄 +50", "🀅 🀅 +50"].map((match) => (
          <div key={match} className="flex items-center justify-between rounded bg-popover p-2 text-sm">
            <span>{match.slice(0, 3)}</span>
            <span className="text-primary">{match.slice(4)}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
