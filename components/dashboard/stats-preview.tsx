import { demoStats } from "@/constants/product";
import { StatCard } from "@/components/layout/stat-card";

export function StatsPreview() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard label="Победы" value={`${demoStats.winRate}%`} />
      <StatCard label="Серия" value={`${demoStats.currentStreak}`} />
      <StatCard label="Лучшее время" value={demoStats.bestTime} />
    </div>
  );
}
