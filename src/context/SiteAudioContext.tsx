"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { useGameAudio, type GameAudioMode } from "@/src/hooks/use-game-audio";

type SiteAudioControls = ReturnType<typeof useGameAudio>;

const SiteAudioContext = createContext<SiteAudioControls | null>(null);

function getSiteAudioMode(pathname: string | null): GameAudioMode {
  if (pathname?.startsWith("/daily") || pathname?.includes("tournament")) {
    return "competition";
  }

  return "main";
}

export function SiteAudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audio = useGameAudio({
    mode: getSiteAudioMode(pathname),
    musicVolume: 0.25,
    sfxVolume: 0.65,
  });

  return <SiteAudioContext.Provider value={audio}>{children}</SiteAudioContext.Provider>;
}

export function useSiteAudio() {
  const audio = useContext(SiteAudioContext);

  if (!audio) {
    throw new Error("useSiteAudio must be used within SiteAudioProvider");
  }

  return audio;
}
