import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { TutorialStepId } from "@/src/lib/tutorial/tutorial-types";

export const TUTORIAL_COMPLETED_STORAGE_KEY = "zen-mahjong:tutorial-completed";

export type TutorialProgress = {
  completed: boolean;
  completedAt?: string;
  lastStep?: string;
  updatedAt: string;
};

function getTutorialProgressStorageKey(userId?: string) {
  return userId ? `${TUTORIAL_COMPLETED_STORAGE_KEY}:${userId}` : TUTORIAL_COMPLETED_STORAGE_KEY;
}

function getLocalTutorialProgress(userId?: string): TutorialProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawProgress = window.localStorage.getItem(getTutorialProgressStorageKey(userId));

    if (!rawProgress) {
      return null;
    }

    const parsed = JSON.parse(rawProgress) as Partial<TutorialProgress>;

    if (parsed.completed !== true) {
      return null;
    }

    const updatedAt = typeof parsed.updatedAt === "string"
      ? parsed.updatedAt
      : typeof parsed.completedAt === "string"
        ? parsed.completedAt
        : new Date().toISOString();

    return {
      completed: true,
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : updatedAt,
      lastStep: typeof parsed.lastStep === "string" ? parsed.lastStep : undefined,
      updatedAt,
    };
  } catch {
    return null;
  }
}

function saveLocalTutorialProgress(lastStep?: string, completedAt = new Date().toISOString(), userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const progress: TutorialProgress = {
    completed: true,
    completedAt,
    lastStep,
    updatedAt: completedAt,
  };

  window.localStorage.setItem(getTutorialProgressStorageKey(userId), JSON.stringify(progress));
}

export async function getTutorialProgress(userId: string): Promise<TutorialProgress | null> {
  if (!db) {
    return getLocalTutorialProgress(userId);
  }

  try {
    const snapshot = await getDoc(doc(db, "users", userId, "progress", "tutorial"));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const updatedAt = typeof data.updatedAt === "string"
      ? data.updatedAt
      : typeof data.completedAt === "string"
        ? data.completedAt
        : new Date().toISOString();

    return {
      completed: data.completed === true,
      completedAt: typeof data.completedAt === "string" ? data.completedAt : undefined,
      lastStep: typeof data.lastStep === "string" ? data.lastStep : undefined,
      updatedAt,
    };
  } catch {
    return getLocalTutorialProgress(userId);
  }
}

export async function markTutorialCompleted(userId: string, lastStep: TutorialStepId | string = "mini_challenge"): Promise<void> {
  const completedAt = new Date().toISOString();
  const progress: TutorialProgress = {
    completed: true,
    completedAt,
    lastStep,
    updatedAt: completedAt,
  };

  if (!db) {
    saveLocalTutorialProgress(lastStep, completedAt, userId);
    return;
  }

  try {
    await setDoc(
      doc(db, "users", userId, "progress", "tutorial"),
      {
        ...progress,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    saveLocalTutorialProgress(lastStep, completedAt, userId);
  }
}

export async function markTutorialCompletedLocal(lastStep: TutorialStepId | string = "mini_challenge") {
  saveLocalTutorialProgress(lastStep);
}

export async function hasCompletedTutorial(userId: string): Promise<boolean> {
  const progress = await getTutorialProgress(userId);

  return progress?.completed === true;
}

export async function resolvePostAuthRedirectPath(userId: string): Promise<"/dashboard" | "/tutorial"> {
  return (await hasCompletedTutorial(userId)) ? "/dashboard" : "/tutorial";
}
