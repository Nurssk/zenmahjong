"use client";

import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/components/theme/ThemeProvider";
import { SiteAudioProvider } from "@/src/context/SiteAudioContext";
import { ToastsProvider } from "@/components/ui/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastsProvider>
      <SiteAudioProvider>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </SiteAudioProvider>
    </ToastsProvider>
  );
}
