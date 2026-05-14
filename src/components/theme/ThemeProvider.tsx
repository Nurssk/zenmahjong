"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/src/context/AuthContext";
import {
  DEFAULT_THEME,
  getThemeFirestore,
  readThemeLocal,
  saveThemeFirestore,
  saveThemeLocal,
  type AppTheme,
} from "@/src/lib/theme/theme-service";

type ThemeUpdateResult = {
  savedToFirestore: boolean;
};

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<ThemeUpdateResult>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading, user } = useAuth();
  const [theme, setThemeState] = useState<AppTheme>(DEFAULT_THEME);

  useEffect(() => {
    const localTheme = readThemeLocal();
    setThemeState(localTheme);
    applyTheme(localTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;
    const userId = user?.uid;

    if (!userId) {
      const localTheme = readThemeLocal();
      setThemeState(localTheme);
      applyTheme(localTheme);
      return undefined;
    }

    void getThemeFirestore(userId)
      .then((firestoreTheme) => {
        if (cancelled || !firestoreTheme) {
          return;
        }

        setThemeState(firestoreTheme);
        saveThemeLocal(firestoreTheme);
        applyTheme(firestoreTheme);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid]);

  const setTheme = useCallback(
    async (nextTheme: AppTheme): Promise<ThemeUpdateResult> => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);
      saveThemeLocal(nextTheme);

      if (!user?.uid) {
        return { savedToFirestore: false };
      }

      try {
        await saveThemeFirestore(user.uid, nextTheme);
        return { savedToFirestore: true };
      } catch {
        return { savedToFirestore: false };
      }
    },
    [user?.uid],
  );

  const value = useMemo(() => ({ setTheme, theme }), [setTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme должен использоваться внутри ThemeProvider");
  }

  return context;
}
