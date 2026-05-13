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
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/src/lib/firebase";
import {
  loginWithEmail as loginWithEmailService,
  loginWithGoogle as loginWithGoogleService,
  logout as logoutService,
  registerWithEmail as registerWithEmailService,
} from "@/src/lib/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const loginWithEmail = useCallback((email: string, password: string) => {
    return loginWithEmailService(email, password);
  }, []);

  const registerWithEmail = useCallback((email: string, password: string, name: string) => {
    return registerWithEmailService(email, password, name);
  }, []);

  const loginWithGoogle = useCallback(() => {
    return loginWithGoogleService();
  }, []);

  const logout = useCallback(() => {
    return logoutService();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
    }),
    [loading, loginWithEmail, loginWithGoogle, logout, registerWithEmail, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }

  return context;
}
