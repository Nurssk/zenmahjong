"use client";

import { LogOut, MapPin, Shield, Sparkles } from "lucide-react";
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

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
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
