"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/src/context/AuthContext";
import { mapFirebaseAuthError } from "@/src/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Главная" },
  { href: "/game", label: "Игра" },
  { href: "/leaderboard", label: "Рейтинг" },
  { href: "/battle-pass", label: "Zen Pass" },
];

export function MarketingHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const { toast } = useToast();
  const fallback = user?.displayName?.slice(0, 2).toUpperCase() ?? "ZM";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
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
                  toast({ title: "Сессия завершена", description: "Ты вышел из Zen Mahjong." });
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
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Начать</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
