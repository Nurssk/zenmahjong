import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { TutorialLearningMode } from "@/components/tutorial/tutorial-learning-mode";

export default function TutorialPage() {
  return (
    <AppShell activePath="/tutorial">
      <MotionShell>
        <TutorialLearningMode />
      </MotionShell>
    </AppShell>
  );
}
