import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { AtmosphericBackground } from "@/components/layout/atmospheric-background";
import { MotionShell } from "@/components/layout/motion-shell";

export default function RegisterPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zen-page px-4 py-12">
      <AtmosphericBackground />
      <Link
        href="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-2 text-sm font-semibold text-muted-foreground backdrop-blur-xl transition hover:border-primary/40 hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Назад
      </Link>
      <MotionShell className="relative z-10 w-full">
        <AuthCard
          title="Регистрация"
          subtitle="Создай профиль, выбери тренера и открой кинематографичный путь Zen Mahjong."
        >
          <RegisterForm />
        </AuthCard>
      </MotionShell>
    </main>
  );
}
