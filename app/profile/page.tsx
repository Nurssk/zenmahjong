"use client";

import { useState } from "react";
import { Check, LogOut, MapPin, Moon, Shield, Sparkles, Sun } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { demoInventory, demoProfile } from "@/constants/product";
import { useAuth } from "@/src/context/AuthContext";
import { mapFirebaseAuthError } from "@/src/lib/auth";
import { useTheme } from "@/src/components/theme/ThemeProvider";
import type { AppTheme } from "@/src/lib/theme/theme-service";

const themeOptions: Array<{
  description: string;
  icon: typeof Sun;
  id: AppTheme;
  title: string;
}> = [
  {
    description: "Светлый спокойный интерфейс для дневных сессий.",
    icon: Sun,
    id: "light",
    title: "Светлая тема",
  },
  {
    description: "Кинематографичный темный стиль Zen Mahjong.",
    icon: Moon,
    id: "dark",
    title: "Темная тема",
  },
];

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  const [savingTheme, setSavingTheme] = useState<AppTheme | null>(null);
  const name = user?.displayName ?? "Игрок Zen Mahjong";
  const email = user?.email ?? "Почта не указана";
  const fallback = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ProtectedRoute>
      <AppShell activePath="/profile">
        <MotionShell>
          <div className="flex flex-col gap-8">
            <PageHeader
              eyebrow="Аккаунт"
              title="Профиль игрока Zen Mahjong"
              description="Данные Firebase Auth, профиль игрока, валюта и инвентарь."
            />

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <Card className="border-primary/20 bg-card/90 shadow-premium">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-5">
                    <Avatar className="size-20 border border-primary/30 shadow-ember">
                      {user?.photoURL ? <AvatarImage src={user.photoURL} alt={name} /> : null}
                      <AvatarFallback className="text-xl font-black">{fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="type-heading-lg text-zen-gradient">{name}</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Почта</p>
                    <p className="font-semibold">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Город</p>
                    <p className="flex items-center gap-2 font-semibold">
                      <MapPin className="size-4 text-primary" />
                      Не указан
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Метод входа</p>
                    <p className="font-semibold">
                      {user?.providerData[0]?.providerId === "google.com" ? "Google" : "Email / Password"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">UID</p>
                    <p className="truncate font-mono text-xs text-primary">{user?.uid}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/90 shadow-premium">
                <CardHeader>
                  <CardTitle>Боевой профиль</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <CurrencyPill type="coins" value={demoProfile.coins} />
                  <CurrencyPill type="gems" value={demoProfile.gems} />
                  <div className="rounded-xl border border-primary/15 bg-popover/70 p-3 text-sm">
                    Подсказки x{demoInventory.hints}
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-popover/70 p-3 text-sm">
                    Отмена x{demoInventory.undo}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-card/85 shadow-premium">
              <CardHeader>
                <CardTitle>Тема интерфейса</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Выбери светлый или темный стиль. Настройка применится сразу и сохранится в профиле.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.id;
                  const saving = savingTheme === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={async () => {
                        setSavingTheme(option.id);
                        const result = await setTheme(option.id);
                        setSavingTheme(null);

                        if (result.savedToFirestore || user?.uid) {
                          toast({
                            title: "Тема обновлена",
                            description: result.savedToFirestore
                              ? "Выбранная тема сохранена в профиле."
                              : "Тема применена локально. Firestore временно недоступен.",
                            variant: result.savedToFirestore ? "default" : "destructive",
                          });
                        } else {
                          toast({
                            title: "Тема обновлена",
                            description: "Выбранная тема сохранена на этом устройстве.",
                          });
                        }
                      }}
                      disabled={savingTheme !== null}
                      className={[
                        "relative min-h-32 rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70",
                        selected
                          ? "border-primary/70 bg-primary/10 shadow-[0_0_34px_rgba(255,107,53,0.18)]"
                          : "border-primary/15 bg-popover/70 hover:border-primary/45 hover:bg-primary/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-card text-primary">
                          <Icon className="size-5" />
                        </span>
                        {selected ? (
                          <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-4 font-display text-xl font-black uppercase tracking-[0.04em] text-foreground">
                        {option.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.description}</p>
                      {saving ? <p className="mt-3 text-xs font-bold text-primary">Сохраняем...</p> : null}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/15 bg-card/80">
                <CardContent className="flex items-center gap-4 p-5">
                  <Shield className="size-9 text-primary" />
                  <div>
                    <p className="font-black">Профиль сохранен в Firestore</p>
                    <p className="text-sm text-muted-foreground">Документ пользователя хранится в коллекции users.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/15 bg-card/80">
                <CardContent className="flex items-center gap-4 p-5">
                  <Sparkles className="size-9 text-purple-energy" />
                  <div>
                    <p className="font-black">Игровой прогресс готов</p>
                    <p className="text-sm text-muted-foreground">Демо-валюта и инвентарь не ломают текущую игру.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline">Изменить профиль</Button>
              <Button
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
                Выйти
              </Button>
            </div>
          </div>
        </MotionShell>
      </AppShell>
    </ProtectedRoute>
  );
}
