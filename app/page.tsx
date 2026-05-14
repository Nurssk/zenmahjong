import { HomeAuthGate } from "@/components/landing/home-auth-gate";
import { MotionShell } from "@/components/layout/motion-shell";

export default function HomePage() {
  return (
    <MotionShell>
      <HomeAuthGate />
    </MotionShell>
  );
}
