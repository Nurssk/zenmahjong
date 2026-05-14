"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { useToast } from "@/components/ui/use-toast";
import { mapFirebaseAuthError } from "@/src/lib/auth";
import { useAuth } from "@/src/context/AuthContext";
import { resolvePostAuthRedirectPath } from "@/src/lib/progress/tutorial-progress-service";

export function LoginForm() {
  const router = useRouter();
  const { loading: authLoading, loginWithEmail, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    void resolvePostAuthRedirectPath(user.uid).then((path) => {
      if (!cancelled) {
        router.replace(path);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, user]);

  if (authLoading || user) {
    return <p className="text-center text-sm font-semibold text-muted-foreground">Проверяем профиль...</p>;
  }

  return (
    <form
      className="flex flex-col gap-4 sm:gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        try {
          const user = await loginWithEmail(
            String(formData.get("email")),
            String(formData.get("password")),
          );
          const redirectPath = await resolvePostAuthRedirectPath(user.uid);
          toast({
            title: "Вход выполнен",
            description: "Добро пожаловать обратно в Zen Mahjong.",
          });
          router.replace(redirectPath);
        } catch (error) {
          toast({
            title: "Ошибка входа",
            description: mapFirebaseAuthError(error),
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Почта
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Пароль
        </Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" size="xl" className="mt-1 h-14 w-full text-lg sm:h-20 sm:text-2xl md:text-3xl" disabled={loading}>
        {loading ? "Входим..." : "Войти"}
        <ArrowRight data-icon="inline-end" />
      </Button>
      <GoogleButton />
      <p className="text-center text-sm text-muted-foreground">
        Впервые в Zen Mahjong?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Регистрация
        </Link>
      </p>
    </form>
  );
}
