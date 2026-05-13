import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Crown,
  Gamepad2,
  LayoutDashboard,
  Medal,
  ShoppingBag,
  User,
} from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/game", label: "Игра", icon: Gamepad2 },
  { href: "/tutorial", label: "Обучение", icon: BookOpen },
  { href: "/leaderboard", label: "Рейтинг", icon: Medal },
  { href: "/stats", label: "Статистика", icon: BarChart3 },
  { href: "/shop", label: "Магазин", icon: ShoppingBag },
  { href: "/battle-pass", label: "Zen Pass", icon: Crown },
  { href: "/profile", label: "Профиль", icon: User },
];

export function SidebarNav({ activePath }: { activePath?: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-primary/20 bg-background-mid/85 p-5 backdrop-blur-xl lg:block">
      <BrandMark />
      <nav className="mt-8 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-primary",
                isActive && "border border-primary/25 bg-primary/15 text-primary shadow-ember-lg",
              )}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
