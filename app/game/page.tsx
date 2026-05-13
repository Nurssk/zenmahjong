import { MotionShell } from "@/components/layout/motion-shell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AtmosphericBackground } from "@/components/layout/atmospheric-background";
import { CoachPanel } from "@/components/game/coach-panel";
import { GameActions } from "@/components/game/game-actions";
import { GameHeader } from "@/components/game/game-header";
import { MahjongBoard } from "@/components/game/mahjong-board";
import { PauseMenu } from "@/components/game/pause-menu";
import { ScorePanel } from "@/components/game/score-panel";

export default function GamePage() {
  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden bg-zen-page">
        <AtmosphericBackground count={20} className="opacity-60" />
        <div className="relative z-10">
          <GameHeader />
          <MotionShell>
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-4">
              <MahjongBoard />
              <GameActions />
            </div>
            <aside className="flex flex-col gap-4">
              <CoachPanel />
              <PauseMenu />
              <ScorePanel />
            </aside>
          </div>
          </MotionShell>
        </div>
      </main>
    </ProtectedRoute>
  );
}
