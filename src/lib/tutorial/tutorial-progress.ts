import type { TutorialStepId } from "@/src/lib/tutorial/tutorial-types";
import {
  markTutorialCompleted,
  markTutorialCompletedLocal,
  TUTORIAL_COMPLETED_STORAGE_KEY,
} from "@/src/lib/progress/tutorial-progress-service";

export { TUTORIAL_COMPLETED_STORAGE_KEY };

export async function saveTutorialCompletion(userId: string | undefined, lastStep: TutorialStepId) {
  if (userId) {
    await markTutorialCompleted(userId, lastStep);
    return;
  }

  await markTutorialCompletedLocal(lastStep);
}

export function saveTutorialCompletionLocal(lastStep: TutorialStepId) {
  void markTutorialCompletedLocal(lastStep);
}
