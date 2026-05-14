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

export function RegisterForm() {
  const router = useRouter();
  const { loading: authLoading, registerWithEmail, user } = useAuth();
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
        const name = String(formData.get("name"));
        const email = String(formData.get("email"));
        const password = String(formData.get("password"));
        const confirmPassword = String(formData.get("confirmPassword"));

        if (password !== confirmPassword) {
          setLoading(false);
          toast({
            title: "Пароли не совпадают",
            description: "Повтори пароль еще раз.",
            variant: "destructive",
          });
          return;
        }

        try {
          const user = await registerWithEmail(email, password, name);
          const redirectPath = await resolvePostAuthRedirectPath(user.uid);
          toast({
            title: "Аккаунт создан",
            description: redirectPath === "/tutorial" ? "Начни обучение с Айро." : "Профиль сохранен.",
          });
          router.replace(redirectPath);
        } catch (error) {
          toast({
            title: "Ошибка регистрации",
            description: mapFirebaseAuthError(error),
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Имя игрока
        </Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
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
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Повтор пароля
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" size="xl" className="mt-1 h-14 w-full text-lg sm:h-20 sm:text-2xl md:text-3xl" disabled={loading}>
        {loading ? "Создаем..." : "Регистрация"}
        <ArrowRight data-icon="inline-end" />
      </Button>
      <GoogleButton />
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Войти
        </Link>
      </p>
    </form>
  );
}
