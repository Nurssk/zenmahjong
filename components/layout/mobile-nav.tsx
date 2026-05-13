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
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-primary/25 bg-card/95 p-2 shadow-glass backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-secondary hover:text-primary"
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
