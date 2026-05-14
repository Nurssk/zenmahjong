"use client";

import Link from "next/link";
import { Gamepad2, Home, Medal, ShoppingBag, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/game", label: "Игра", icon: Gamepad2 },
  { href: "/leaderboard", label: "Рейтинг", icon: Medal },
  { href: "/shop", label: "Магазин", icon: ShoppingBag },
  { href: "/profile", label: "Профиль", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-2 bottom-2 z-40 grid grid-cols-5 rounded-2xl border border-primary/25 bg-card/95 p-1.5 shadow-glass backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:p-2 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold text-muted-foreground transition hover:bg-secondary hover:text-primary sm:min-h-14 sm:px-2 sm:py-2 sm:text-[11px]"
          >
            <Icon className="size-4 sm:size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
