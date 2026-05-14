import { MotionShell } from "@/components/layout/motion-shell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AtmosphericBackground } from "@/components/layout/atmospheric-background";
import { GameHeader } from "@/components/game/game-header";
import { MahjongBoard } from "@/components/game/mahjong-board";

export default function GamePage() {
  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden bg-zen-page">
        <AtmosphericBackground count={20} className="opacity-60" />
        <div className="relative z-10">
          <GameHeader />
          <MotionShell>
            <div className="mx-auto max-w-7xl px-1.5 py-2 sm:px-3 md:px-8 md:py-8">
              <MahjongBoard persistGame />
            </div>
          </MotionShell>
        </div>
      </main>
    </ProtectedRoute>
  );
}
