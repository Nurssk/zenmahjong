import { Crown, Gem, Package, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { ShopTabs } from "@/components/shop/shop-tabs";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { shopItems } from "@/constants/product";
import { demoProfile } from "@/constants/product";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <AppShell activePath="/shop">
      <MotionShell>
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Экономика"
            title="Магазин"
            description="Премиальные тренеры, скины доски, подсказки, отмены, наборы, монеты и самоцветы."
          />
          <div className="flex flex-wrap gap-3">
            <CurrencyPill type="coins" value={demoProfile.coins} />
            <CurrencyPill type="gems" value={demoProfile.gems} />
          </div>
          <div className="grid gap-4 overflow-hidden rounded-2xl border border-primary/35 bg-zen-cta p-6 text-background shadow-ember-lg lg:grid-cols-[1fr_260px]">
            <div>
              <p className="type-caption text-background/70">Главный набор</p>
              <h2 className="type-heading-xl mt-3 text-background">Набор основателя Лунных врат</h2>
              <p className="type-body mt-3 max-w-2xl text-background/75">
                Внутри: превью тренера Vega, скин костей из черного нефрита,
                800 монет, 90 самоцветов и премиальный турнирный знак.
              </p>
            </div>
            <div className="flex items-end justify-between gap-4 rounded-xl bg-background/90 p-5 text-foreground lg:flex-col lg:items-start">
              <Package className="size-9 text-primary" />
              <div>
                <p className="text-2xl font-black">$9.99</p>
                <Button size="sm" className="mt-3">Открыть</Button>
              </div>
            </div>
          </div>
          <ShopTabs />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ShopItemCard
              title="1,200 монет фокуса"
              description="Пополнение расходников и ежедневных наборов."
              price="1.99"
              currency="coin"
              rarity="common"
              icon={Sparkles}
            />
            <ShopItemCard
              title="80 самоцветов"
              description="Премиальная валюта для редких тренеров и скинов."
              price="4.99"
              currency="gem"
              rarity="rare"
              icon={Gem}
            />
            <ShopItemCard
              title="Тренер Vega"
              description="Стратегический AI-тренер с тактическими подсказками."
              price={600}
              currency="gem"
              rarity="epic"
              icon={Crown}
            />
            {shopItems.slice(2).map((item) => (
              <ShopItemCard
                key={item.id}
                title={item.name}
                description={item.description}
                price={item.price}
                currency={item.price.includes("монет") ? "coin" : "gem"}
                rarity={item.rarity ?? "common"}
              />
            ))}
          </div>
        </div>
      </MotionShell>
    </AppShell>
  );
}
