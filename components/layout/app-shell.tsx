"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { demoProfile } from "@/constants/product";
import { useAuth } from "@/src/context/AuthContext";
import { mapFirebaseAuthError } from "@/src/lib/auth";

export function AppShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  const { isAuthenticated, logout, user } = useAuth();
  const { toast } = useToast();
  const fallback = user?.displayName
    ? user.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ZM";

  return (
    <div className="min-h-screen bg-zen-page">
      <SidebarNav activePath={activePath} />
      <main className="min-h-screen pb-28 lg:ml-72 lg:pb-8">
        <div className="sticky top-0 z-20 border-b border-primary/20 bg-background-mid/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-end gap-3 px-4 md:px-8">
            <CurrencyPill type="coins" value={demoProfile.coins} />
            <CurrencyPill type="gems" value={demoProfile.gems} />
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
