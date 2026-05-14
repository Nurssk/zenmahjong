import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/src/lib/firebase";

export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "zen-mahjong-theme";
export const DEFAULT_THEME: AppTheme = "dark";

export function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

export function readThemeLocal(): AppTheme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isAppTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
}

export function saveThemeLocal(theme: AppTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export async function getThemeFirestore(userId: string): Promise<AppTheme | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "users", userId));
  const theme = snapshot.exists() ? snapshot.data().theme : null;

  return isAppTheme(theme) ? theme : null;
}

export async function saveThemeFirestore(userId: string, theme: AppTheme) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firestore is not configured.");
  }

  await setDoc(
    doc(db, "users", userId),
    {
      theme,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
