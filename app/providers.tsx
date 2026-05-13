"use client";

import { AuthProvider } from "@/src/context/AuthContext";
import { SiteAudioProvider } from "@/src/context/SiteAudioContext";
import { ToastsProvider } from "@/components/ui/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastsProvider>
      <SiteAudioProvider>
        <AuthProvider>{children}</AuthProvider>
      </SiteAudioProvider>
    </ToastsProvider>
  );
}
