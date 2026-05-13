import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/layout/glass-panel";
import { productName } from "@/constants/product";

export function CTASection() {
  return (
    <GlassPanel className="p-8 text-center md:p-12">
      <h2 className="type-heading-xl text-zen-gradient">
        Создай ежедневный ритуал фокуса с {productName}.
      </h2>
      <p className="type-body-lg mx-auto mt-4 max-w-2xl text-muted-foreground">
        Пройди настройку, встреться с AI-тренером и войди в цикл ежедневных
        турниров за несколько минут.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/onboarding">Начать настройку</Link>
        </Button>
      </div>
    </GlassPanel>
  );
}
