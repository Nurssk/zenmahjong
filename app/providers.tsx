"use client";

import { AuthProvider } from "@/src/context/AuthContext";
import { ToastsProvider } from "@/components/ui/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastsProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastsProvider>
  );
}
