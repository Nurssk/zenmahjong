"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Volume2, VolumeX } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";
import {
  DEFAULT_ECONOMY,
  ECONOMY_STORAGE_KEY,
  ECONOMY_UPDATED_EVENT,
  createDefaultPlayerEconomy,
  getPlayerEconomy,
} from "@/src/lib/economy/economy-service";

export function GameHeader() {
  const { loading: authLoading, user } = useAuth();
  const { setMuted } = useSiteAudio();
  const { setSoundEnabled, soundEnabled } = useSoundPreference();
  const [coins, setCoins] = useState<number>(DEFAULT_ECONOMY.coins);
  const [gems, setGems] = useState<number>(DEFAULT_ECONOMY.gems);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [setMuted, soundEnabled]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;
    const userId = user?.uid;
    const defaultEconomy = createDefaultPlayerEconomy(userId);
    setCoins(defaultEconomy.coins);
    setGems(defaultEconomy.gems);

    const refreshEconomy = () => {
      void getPlayerEconomy(userId)
        .then((economy) => {
          if (!cancelled) {
            setCoins(economy.coins);
            setGems(economy.gems);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCoins(defaultEconomy.coins);
            setGems(defaultEconomy.gems);
          }
        });
    };

    refreshEconomy();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ECONOMY_STORAGE_KEY) {
        refreshEconomy();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);
    };
  }, [authLoading, user?.uid]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/20 bg-background/85 px-2 py-2 backdrop-blur-xl md:px-4 md:py-3">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard">
          <Home data-icon="inline-start" />
          Главная
        </Link>
      </Button>
      <div className="flex items-center gap-2 md:justify-end">
        <CurrencyPill type="coins" value={coins} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
        <CurrencyPill type="gems" value={gems} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
        <SoundPreferenceButton
          soundEnabled={soundEnabled}
          onToggle={() => setSoundEnabled((current) => !current)}
        />
      </div>
    </header>
  );
}

function SoundPreferenceButton({
  onToggle,
  soundEnabled,
}: {
  onToggle: () => void;
  soundEnabled: boolean;
}) {
  const label = soundEnabled ? "Звук включён" : "Звук выключен";
  const Icon = soundEnabled ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-popover text-primary shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-primary/45 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:size-10"
    >
      <Icon className="size-4" />
    </button>
  );
}
