"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AtmosphericBackground } from "@/components/layout/atmospheric-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import {
  completeOnboarding,
  getUserProfile,
  mapFirebaseAuthError,
  type ExperienceLevel,
  type FocusGoal,
  type PreferredSessionLength,
} from "@/src/lib/auth";

const focusGoals: Array<{ id: FocusGoal; title: string; description: string }> = [
  {
    id: "relax",
    title: "Расслабиться",
    description: "Спокойные партии, мягкий темп и ощущение контроля.",
  },
  {
    id: "attention",
    title: "Тренировать внимание",
    description: "Короткие сессии для фокуса, памяти и точных решений.",
  },
  {
    id: "daily_challenges",
    title: "Проходить ежедневные челленджи",
    description: "Новые задачи каждый день и награды за стабильность.",
  },
  {
    id: "leaderboard",
    title: "Соревноваться в рейтинге",
    description: "Быстрые победы, серии и место среди сильнейших игроков.",
  },
];

const experienceLevels: Array<{ id: ExperienceLevel; title: string; description: string }> = [
  { id: "beginner", title: "Новичок", description: "Поможем освоиться без давления." },
  { id: "intermediate", title: "Средний уровень", description: "Больше темпа, меньше подсказок." },
  { id: "advanced", title: "Опытный игрок", description: "Ставка на скорость и чистые серии." },
];

const sessionLengths: Array<{ id: PreferredSessionLength; title: string; description: string }> = [
  { id: 3, title: "3 минуты", description: "Быстрый фокус между делами." },
  { id: 5, title: "5 минут", description: "Классическая спокойная сессия." },
  { id: 10, title: "10 минут", description: "Глубокая партия без спешки." },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [focusGoal, setFocusGoal] = useState<FocusGoal>("relax");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("beginner");
  const [city, setCity] = useState("");
  const [preferredSessionLength, setPreferredSessionLength] = useState<PreferredSessionLength>(5);

  const steps = useMemo(
    () => [
      "Добро пожаловать",
      "Цель",
      "Опыт",
      "Город",
      "Сессия",
      "Финиш",
    ],
    [],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/onboarding");
      return;
    }

    const uid = user.uid;
    let cancelled = false;

    async function loadProfile() {
      try {
        const profile = await getUserProfile(uid);

        if (cancelled) {
          return;
        }

        if (profile?.onboardingCompleted === true) {
          router.replace("/dashboard");
          return;
        }

        if (profile?.focusGoal) {
          setFocusGoal(profile.focusGoal);
        }
        if (profile?.experienceLevel) {
          setExperienceLevel(profile.experienceLevel);
        }
        if (profile?.city) {
          setCity(profile.city);
        }
        if (profile?.preferredSessionLength) {
          setPreferredSessionLength(profile.preferredSessionLength);
        }

        setProfileLoading(false);
      } catch (error) {
        if (!cancelled) {
          setProfileLoading(false);
          toast({
            title: "Профиль недоступен",
            description: mapFirebaseAuthError(error),
            variant: "destructive",
          });
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, toast, user]);

  const canContinue = step !== 3 || city.trim().length > 1;

  async function finishOnboarding() {
    if (!user) {
      router.replace("/login?next=/onboarding");
      return;
    }

    setSaving(true);
    try {
      await completeOnboarding(user.uid, {
        focusGoal,
        experienceLevel,
        city,
        preferredSessionLength,
      });
      toast({
        title: "Путь настроен",
        description: "Zen Mahjong готов к первой сессии.",
      });
      router.replace("/dashboard");
    } catch (error) {
      toast({
        title: "Не удалось сохранить",
        description: mapFirebaseAuthError(error),
        variant: "destructive",
      });
      setSaving(false);
    }
  }

  if (authLoading || profileLoading) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zen-page px-4">
        <AtmosphericBackground count={16} />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-card/80 p-8 text-center shadow-glass backdrop-blur-xl">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div>
            <p className="font-display text-xl font-black uppercase tracking-[0.06em] text-zen-gradient">
              Готовим путь
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Проверяем профиль Zen Mahjong.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zen-page px-4 py-6 sm:py-10">
      <AtmosphericBackground count={22} />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              Настройка профиля
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Шаг {step + 1} из {steps.length}
            </p>
          </div>
          <div className="hidden text-right text-xs uppercase tracking-[0.2em] text-muted-foreground sm:block">
            {steps[step]}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-6 gap-2">
          {steps.map((item, index) => (
            <div
              key={item}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index <= step ? "bg-zen-cta shadow-[0_0_18px_rgba(255,107,53,0.45)]" : "bg-border/80",
              )}
            />
          ))}
        </div>

        <section className="rounded-[2rem] border border-primary/20 bg-card/75 p-5 shadow-glass backdrop-blur-2xl sm:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {step === 0 ? (
                <WelcomeStep />
              ) : null}

              {step === 1 ? (
                <ChoiceStep
                  eyebrow="Цель игрока"
                  title="Что должно давать тебе Zen Mahjong?"
                  subtitle="Выбери главный ритм. Его можно будет изменить позже."
                  options={focusGoals}
                  value={focusGoal}
                  onChange={setFocusGoal}
                />
              ) : null}

              {step === 2 ? (
                <ChoiceStep
                  eyebrow="Опыт"
                  title="Какой уровень партии тебе ближе?"
                  subtitle="AI-тренер подстроит подсказки и темп под твой опыт."
                  options={experienceLevels}
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                />
              ) : null}

              {step === 3 ? (
                <CityStep city={city} onChange={setCity} />
              ) : null}

              {step === 4 ? (
                <ChoiceStep
                  eyebrow="Длина сессии"
                  title="Сколько времени держим фокус?"
                  subtitle="Zen Mahjong будет предлагать партии под выбранный темп."
                  options={sessionLengths}
                  value={preferredSessionLength}
                  onChange={setPreferredSessionLength}
                />
              ) : null}

              {step === 5 ? (
                <FinishStep
                  focusGoal={focusGoals.find((goal) => goal.id === focusGoal)?.title ?? "Расслабиться"}
                  experienceLevel={
                    experienceLevels.find((level) => level.id === experienceLevel)?.title ?? "Новичок"
                  }
                  city={city}
                  preferredSessionLength={preferredSessionLength}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-primary/20 bg-popover/70"
              disabled={step === 0 || saving}
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
            >
              Назад
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                size="xl"
                disabled={!canContinue}
                onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
              >
                Далее
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button type="button" size="xl" disabled={saving} onClick={finishOnboarding}>
                {saving ? "Сохраняем..." : "Начать игру"}
                {saving ? <Loader2 data-icon="inline-end" className="animate-spin" /> : <ArrowRight data-icon="inline-end" />}
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function WelcomeStep() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          Zen Mahjong
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-black uppercase leading-tight tracking-[0.04em] text-zen-gradient drop-shadow-[0_0_24px_rgba(255,107,53,0.2)] sm:text-5xl lg:text-6xl">
          Добро пожаловать в Zen Mahjong
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Это спокойная платформа маджонга для фокуса, коротких игровых ритуалов и
          ежедневного прогресса. Настроим темп, цель и рейтинг перед первой партией.
        </p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-black/20 p-5 shadow-glow">
        <div className="grid aspect-square place-items-center rounded-xl border border-primary/15 bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.22),rgba(108,99,255,0.12)_42%,rgba(14,14,16,0.85)_72%)]">
          <div className="grid size-32 place-items-center rounded-full border border-primary/30 bg-card/70 text-6xl shadow-glass">
            <span aria-hidden="true">🀄</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceStep<TValue extends string | number>({
  eyebrow,
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: Array<{ id: TValue; title: string; description: string }>;
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <div>
      <StepHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "group relative min-h-32 overflow-hidden rounded-2xl border p-5 text-left transition-all",
              value === option.id
                ? "border-primary/70 bg-primary/10 shadow-glow"
                : "border-primary/15 bg-popover/55 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{option.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{option.description}</p>
              </div>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border transition-all",
                  value === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/25 text-transparent group-hover:text-primary/50",
                )}
              >
                <Check className="size-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CityStep({ city, onChange }: { city: string; onChange: (value: string) => void }) {
  return (
    <div>
      <StepHeader
        eyebrow="Город"
        title="Где будет твоя арена?"
        subtitle="Город нужен для городского рейтинга."
      />
      <div className="max-w-xl">
        <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Город
        </Label>
        <Input
          id="city"
          value={city}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Например, Алматы"
          className="mt-3"
          autoComplete="address-level2"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Используем только для локального рейтинга и городских событий Zen Mahjong.
        </p>
      </div>
    </div>
  );
}

function FinishStep({
  focusGoal,
  experienceLevel,
  city,
  preferredSessionLength,
}: {
  focusGoal: string;
  experienceLevel: string;
  city: string;
  preferredSessionLength: PreferredSessionLength;
}) {
  const summary = [
    ["Цель", focusGoal],
    ["Уровень", experienceLevel],
    ["Город", city],
    ["Сессия", `${preferredSessionLength} минут`],
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Финиш"
        title="Профиль готов"
        subtitle="Сохраним настройки и откроем главную арену Zen Mahjong."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-primary/15 bg-popover/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">{eyebrow}</p>
      <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-[0.04em] text-zen-gradient sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}
