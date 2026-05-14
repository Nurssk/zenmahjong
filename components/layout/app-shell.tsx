"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, LogOut, Volume2, VolumeX } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { mapFirebaseAuthError } from "@/src/lib/auth";
import {
  DEFAULT_ECONOMY,
  ECONOMY_STORAGE_KEY,
  ECONOMY_UPDATED_EVENT,
  createDefaultPlayerEconomy,
  getPlayerEconomy,
} from "@/src/lib/economy/economy-service";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";

export function AppShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const { setMuted } = useSiteAudio();
  const { setSoundEnabled, soundEnabled } = useSoundPreference();
  const { toast } = useToast();
  const [coins, setCoins] = useState<number>(DEFAULT_ECONOMY.coins);
  const [gems, setGems] = useState<number>(DEFAULT_ECONOMY.gems);
  const fallback = user?.displayName
    ? user.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ZM";

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
    <div className="min-h-screen bg-zen-page">
      <SidebarNav activePath={activePath} />
      <main className="min-h-screen pb-24 pt-14 lg:ml-72 lg:pb-8 md:pt-16">
        <div className="fixed inset-x-0 top-0 z-50 border-b border-primary/20 bg-background/85 backdrop-blur-xl lg:left-72">
          <div className="flex h-14 items-center justify-between gap-2 px-2 sm:gap-3 md:h-16 md:px-8">
            <Link
              href="/dashboard"
              className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-popover px-2.5 text-sm font-bold text-foreground transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-h-10 md:px-4"
            >
              <Home className="size-4 text-primary" />
              <span className="hidden sm:inline">Главная</span>
            </Link>
            <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2 md:gap-3">
              <CurrencyPill type="coins" value={coins} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
              <CurrencyPill type="gems" value={gems} className="px-2 py-1.5 text-xs sm:px-3 md:px-4 md:py-2 md:text-sm" />
              <SoundPreferenceButton
                soundEnabled={soundEnabled}
                onToggle={() => setSoundEnabled((current) => !current)}
              />
              {isAuthenticated ? (
                <>
                  <Button asChild variant="ghost" className="hidden sm:inline-flex">
                    <Link href="/profile">Профиль</Link>
                  </Button>
                  <Avatar className="size-9 border border-primary/25 md:size-10">
                    {user?.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName ?? "Профиль"} /> : null}
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Выйти"
                    onClick={async () => {
                      try {
                        await logout();
                        toast({
                          title: "Сессия завершена",
                          description: "Ты вышел из Zen Mahjong.",
                        });
                      } catch (error) {
                        toast({
                          title: "Не удалось выйти",
                          description: mapFirebaseAuthError(error),
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <LogOut className="size-4" />
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/login">Войти</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="px-2 py-3 sm:px-4 md:px-8 md:py-8">{children}</div>
      </main>
      <MobileNav />
    </div>
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
