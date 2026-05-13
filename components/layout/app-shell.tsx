"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { demoProfile } from "@/constants/product";
import { useAuth } from "@/src/context/AuthContext";
import { useSiteAudio } from "@/src/context/SiteAudioContext";
import { mapFirebaseAuthError } from "@/src/lib/auth";
import { useSoundPreference } from "@/src/hooks/use-sound-preference";

export function AppShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  const { isAuthenticated, logout, user } = useAuth();
  const { setMuted } = useSiteAudio();
  const { setSoundEnabled, soundEnabled } = useSoundPreference();
  const { toast } = useToast();
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

  return (
    <div className="min-h-screen bg-zen-page">
      <SidebarNav activePath={activePath} />
      <main className="min-h-screen pb-28 lg:ml-72 lg:pb-8">
        <div className="sticky top-0 z-20 border-b border-primary/20 bg-background-mid/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-end gap-1.5 px-3 sm:gap-2 md:gap-3 md:px-8">
            <CurrencyPill type="coins" value={demoProfile.coins} className="px-2.5 py-2 sm:px-4" />
            <CurrencyPill type="gems" value={demoProfile.gems} className="px-2.5 py-2 sm:px-4" />
            <SoundPreferenceButton
              soundEnabled={soundEnabled}
              onToggle={() => {
                setSoundEnabled((current) => {
                  const nextValue = !current;
                  setMuted(!nextValue);
                  return nextValue;
                });
              }}
            />
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/profile">Профиль</Link>
                </Button>
                <Avatar className="border border-primary/25">
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
        <div className="px-4 py-8 md:px-8">{children}</div>
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
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-popover text-primary shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-primary/45 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Icon className="size-4" />
    </button>
  );
}
