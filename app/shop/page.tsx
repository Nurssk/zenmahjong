"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bot, Check, Coins, Gem, Gift, Lightbulb, RotateCcw } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FakePaymentModal } from "@/components/shop/fake-payment-modal";
import { AppShell } from "@/components/layout/app-shell";
import { MotionShell } from "@/components/layout/motion-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { COIN_PACKS, GEM_PACKS, HINT_PACKS, SENSEI_CHARACTER_ITEMS, UNDO_PACKS } from "@/src/lib/economy/shop-catalog";
import {
  DEFAULT_ECONOMY,
  ECONOMY_STORAGE_KEY,
  ECONOMY_UPDATED_EVENT,
  createDefaultPlayerEconomy,
  InsufficientCoinsError,
  getPlayerEconomy,
  purchaseShopItem,
  updateCoinBalance,
  updateGemBalance,
  type ConsumableShopItem,
  type DemoPaymentShopItem,
  type HintShopItem,
  type PlayerEconomy,
  type UndoShopItem,
} from "@/src/lib/economy/economy-service";
import {
  InsufficientGemsError,
  createDefaultSenseiProfile,
  getSenseiProfile,
  purchaseUgway,
  selectSensei,
  type SenseiProfile,
} from "@/src/lib/sensei/sensei-service";
import type { SenseiCharacterShopItem } from "@/src/lib/economy/economy-types";

const currencyFormatter = new Intl.NumberFormat("ru-RU");

export default function ShopPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [economy, setEconomy] = useState<PlayerEconomy>(() => ({
    coins: DEFAULT_ECONOMY.coins,
    gems: DEFAULT_ECONOMY.gems,
    hints: DEFAULT_ECONOMY.hints,
    undos: DEFAULT_ECONOMY.undos,
    updatedAt: new Date().toISOString(),
  }));
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [purchasedItemId, setPurchasedItemId] = useState<string | null>(null);
  const [selectedPaymentPack, setSelectedPaymentPack] = useState<DemoPaymentShopItem | null>(null);
  const [claimingPaymentPack, setClaimingPaymentPack] = useState(false);
  const [senseiProfile, setSenseiProfile] = useState<SenseiProfile>(() => createDefaultSenseiProfile());
  const purchasedResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;
    const userId = user?.uid;
    setEconomy(createDefaultPlayerEconomy(userId));

    const refreshEconomy = () => {
      void Promise.all([getPlayerEconomy(userId), getSenseiProfile(userId)])
        .then(([nextEconomy, nextSenseiProfile]) => {
          if (!cancelled) {
            setEconomy(nextEconomy);
            setSenseiProfile(nextSenseiProfile);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setEconomy(createDefaultPlayerEconomy(userId));
            setSenseiProfile(createDefaultSenseiProfile());
          }
        });
    };

    refreshEconomy();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ECONOMY_STORAGE_KEY) {
        refreshEconomy();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ECONOMY_UPDATED_EVENT, refreshEconomy);
    };
  }, [authLoading, user?.uid]);

  useEffect(() => () => {
    if (purchasedResetTimeoutRef.current) {
      window.clearTimeout(purchasedResetTimeoutRef.current);
    }
  }, []);

  async function handleConsumablePurchase(item: ConsumableShopItem) {
    if (purchasingItemId) {
      return;
    }

    if (economy.coins < item.priceCoins) {
      toast({
        title: "Не хватает монет",
        description: "Получите монеты в демо-разделе или сыграйте партию.",
        variant: "destructive",
      });
      return;
    }

    setPurchasingItemId(item.id);
    setPurchasedItemId(null);

    try {
      const nextEconomy = await purchaseShopItem(item.id, user?.uid);
      setEconomy(nextEconomy);
      setPurchasedItemId(item.id);
      toast({
        title: "Покупка выполнена",
        description: `${item.title} добавлены в ваш запас.`,
      });
      if (purchasedResetTimeoutRef.current) {
        window.clearTimeout(purchasedResetTimeoutRef.current);
      }
      purchasedResetTimeoutRef.current = window.setTimeout(() => {
        purchasedResetTimeoutRef.current = null;
        setPurchasedItemId((current) => (current === item.id ? null : current));
      }, 1600);
    } catch (error) {
      toast({
        title: error instanceof InsufficientCoinsError ? "Не хватает монет" : "Покупка недоступна",
        description: "Баланс не изменён. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setPurchasingItemId(null);
    }
  }

  async function handleClaimCurrencyGift() {
    if (!selectedPaymentPack || claimingPaymentPack) {
      return;
    }

    const pack = selectedPaymentPack;
    setClaimingPaymentPack(true);

    try {
      const nextEconomy =
        pack.type === "gems"
          ? await updateGemBalance(pack.gems, user?.uid)
          : await updateCoinBalance(pack.coins, user?.uid);
      setEconomy(nextEconomy);
      setSelectedPaymentPack(null);
      toast({
        title: pack.type === "gems" ? "Самоцветы начислены" : "Монеты начислены",
        description:
          pack.type === "gems"
            ? `+${currencyFormatter.format(pack.gems)} самоцветов`
            : `+${currencyFormatter.format(pack.coins)} монет`,
      });
    } catch {
      toast({
        title: "Подарок недоступен",
        description: "Баланс не изменён. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setClaimingPaymentPack(false);
    }
  }

  async function handleSenseiPurchase(item: SenseiCharacterShopItem) {
    if (purchasingItemId) {
      return;
    }

    if (!user?.uid) {
      toast({
        title: "Войдите в аккаунт",
        description: "Премиальные сенсеи доступны только для аккаунта.",
        variant: "destructive",
      });
      return;
    }

    if (economy.gems < item.priceGems) {
      toast({
        title: "Недостаточно самоцветов",
        description: "Пополните баланс самоцветов в магазине.",
        variant: "destructive",
      });
      return;
    }

    setPurchasingItemId(item.id);

    try {
      const result = await purchaseUgway(user.uid);
      setEconomy(result.economy);
      setSenseiProfile(result.profile);
      toast({
        title: result.purchased ? "Угвей куплен" : "Угвей уже куплен",
        description: result.purchased ? "Угвей выбран активным сенсеем." : "Покупка не была списана повторно.",
      });
    } catch (error) {
      toast({
        title: error instanceof InsufficientGemsError ? "Недостаточно самоцветов" : "Покупка недоступна",
        description: "Баланс не изменён. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setPurchasingItemId(null);
    }
  }

  async function handleSenseiSelect(item: SenseiCharacterShopItem) {
    if (purchasingItemId || !user?.uid) {
      return;
    }

    setPurchasingItemId(item.id);

    try {
      const nextProfile = await selectSensei(user.uid, item.senseiId);
      setSenseiProfile(nextProfile);
      toast({
        title: "Угвей выбран",
        description: "Сенсей обновится в игровом оверлее.",
      });
    } catch {
      toast({
        title: "Не удалось выбрать сенсея",
        description: "Проверьте подключение и попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setPurchasingItemId(null);
    }
  }

  return (
    <ProtectedRoute>
      <AppShell activePath="/shop">
        <MotionShell>
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:gap-8">
          <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-background-mid to-[#140812] p-4 shadow-glass md:rounded-2xl md:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <PageHeader
                eyebrow="Economy"
                title="Магазин"
                description="Демо-монетизация Zen Mahjong: монеты начисляются без реальной оплаты, подсказки покупаются за игровой баланс."
              />
              <div className="rounded-xl border border-primary/20 bg-popover/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Ваш баланс</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <CurrencyPill type="coins" value={economy.coins} />
                  <CurrencyPill type="gems" value={economy.gems} />
                  <div className="inline-flex items-center gap-2 rounded-lg border border-purple-energy/30 bg-popover px-4 py-2 text-sm font-bold">
                    <Lightbulb className="size-5 text-purple-energy" />
                    <span>{currencyFormatter.format(economy.hints)} подсказок</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-popover px-4 py-2 text-sm font-bold">
                    <RotateCcw className="size-5 text-primary" />
                    <span>{currencyFormatter.format(economy.undos)} отмен</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ShopSection
            badge="Оплата позже"
            description="Паки выглядят как платные, но сейчас это безопасный демо-подарок для презентации."
            title="Монеты"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {COIN_PACKS.map((pack) => (
                <PaymentPackCard key={pack.id} accent="coins" pack={pack} onSelect={() => setSelectedPaymentPack(pack)} />
              ))}
            </div>
          </ShopSection>

          <ShopSection
            badge="Премиум"
            description="Самоцветы скоро можно будет использовать для премиум-тем и косметических наград."
            title="Самоцветы"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {GEM_PACKS.map((pack) => (
                <PaymentPackCard key={pack.id} accent="gems" pack={pack} onSelect={() => setSelectedPaymentPack(pack)} />
              ))}
            </div>
          </ShopSection>

          <ShopSection
            badge="1000 самоцветов"
            description="Airo остаётся бесплатным сенсеем, а Угвей открывается как премиальный наставник."
            title="Сенсеи"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
              {SENSEI_CHARACTER_ITEMS.map((item) => (
                <SenseiCharacterCard
                  key={item.id}
                  item={item}
                  owned={senseiProfile.ownedSenseis.includes(item.senseiId)}
                  selected={senseiProfile.selectedSensei === item.senseiId}
                  canAfford={economy.gems >= item.priceGems}
                  busy={purchasingItemId === item.id}
                  disabled={purchasingItemId !== null}
                  onPurchase={() => void handleSenseiPurchase(item)}
                  onSelect={() => void handleSenseiSelect(item)}
                />
              ))}
              <article className="rounded-xl border border-primary/15 bg-card/70 p-5 shadow-glass backdrop-blur-xl md:p-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-xl border border-primary/25 bg-primary/12 text-primary">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-black uppercase tracking-[0.04em]">Айро</p>
                    <p className="text-sm text-muted-foreground">Стартовый сенсей</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Айро доступен всем игрокам бесплатно и остаётся базовым наставником для стратегических советов.
                </p>
                <Badge className="mt-5 rounded-lg border border-green-success/30 bg-green-success/12 text-green-success">
                  Доступен
                </Badge>
              </article>
            </div>
          </ShopSection>

          <ShopSection
            badge="Игровой баланс"
            description="Подсказки расходуются в лёгком и среднем режимах, а покупаются только за монеты."
            title="Подсказки"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {HINT_PACKS.map((item) => (
                <ConsumablePackCard
                  key={item.id}
                  item={item}
                  disabled={purchasingItemId !== null}
                  canAfford={economy.coins >= item.priceCoins}
                  purchased={purchasedItemId === item.id}
                  purchasing={purchasingItemId === item.id}
                  onPurchase={() => void handleConsumablePurchase(item)}
                  variant="hint"
                />
              ))}
            </div>
          </ShopSection>

          <ShopSection
            badge="Дешевле подсказок"
            description="Отмены помогают исправлять последние ходы и стоят меньше, чем подсказки."
            title="Отмены"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {UNDO_PACKS.map((item) => (
                <ConsumablePackCard
                  key={item.id}
                  item={item}
                  disabled={purchasingItemId !== null}
                  canAfford={economy.coins >= item.priceCoins}
                  purchased={purchasedItemId === item.id}
                  purchasing={purchasingItemId === item.id}
                  onPurchase={() => void handleConsumablePurchase(item)}
                  variant="undo"
                />
              ))}
            </div>
          </ShopSection>
          </div>
        </MotionShell>

        <FakePaymentModal
          loading={claimingPaymentPack}
          pack={selectedPaymentPack}
          onClose={() => {
            if (!claimingPaymentPack) {
              setSelectedPaymentPack(null);
            }
          }}
          onConfirm={() => void handleClaimCurrencyGift()}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

function ShopSection({
  badge,
  children,
  description,
  title,
}: {
  badge: string;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-lg border border-primary/25 bg-popover/90 text-primary">
            {badge}
          </Badge>
          <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">{title}</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PaymentPackCard({
  accent,
  onSelect,
  pack,
}: {
  accent: "coins" | "gems";
  onSelect: () => void;
  pack: DemoPaymentShopItem;
}) {
  const isGems = accent === "gems";
  const Icon = isGems ? Gem : Coins;
  const amount = pack.type === "gems" ? pack.gems : pack.coins;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/90 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/50 md:p-6",
        pack.featured && !isGems ? "border-primary/55 shadow-[0_0_45px_rgba(255,107,53,0.18)]" : null,
        pack.featured && isGems ? "border-purple-energy/60 shadow-[0_0_45px_rgba(108,99,255,0.2)]" : null,
        !pack.featured ? "border-primary/18" : null,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          isGems ? "via-purple-energy/80" : "via-gold/80",
        )}
      />
      <div className={cn("absolute right-0 top-0 size-32 rounded-full blur-3xl", isGems ? "bg-purple-energy/16" : "bg-gold/12")} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid size-14 place-items-center rounded-xl border",
              isGems ? "border-purple-energy/35 bg-purple-energy/12 text-purple-energy" : "border-gold/35 bg-gold/12 text-gold",
            )}
          >
            <Icon className="size-7" fill="currentColor" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="rounded-lg bg-purple-energy/15 text-purple-energy">
              Демо
            </Badge>
            {pack.featured ? (
              <Badge variant="premium" className="rounded-lg">
                Лучший выбор
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Подарочный набор</p>
        <h3 className="mt-2 font-display text-4xl font-black uppercase tracking-[0.04em] text-foreground">
          {pack.title}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{pack.description}</p>
        <div className={cn("mt-5 rounded-lg border bg-black/25 px-3 py-3", isGems ? "border-purple-energy/25" : "border-gold/20")}>
          <p className="text-xs font-bold text-muted-foreground">Цена после запуска оплаты</p>
          <p className={cn("mt-1 font-display text-2xl font-black", isGems ? "text-purple-energy" : "text-gold")}>
            {currencyFormatter.format(pack.priceKzt)} ₸
          </p>
        </div>
        <Button className="mt-4 w-full" onClick={onSelect}>
          <Gift className="size-4" />
          Получить
        </Button>
        <p className={cn("mt-2 text-center text-xs font-bold", isGems ? "text-purple-energy" : "text-gold")}>
          +{currencyFormatter.format(amount)} {isGems ? "самоцветов" : "монет"}
        </p>
        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">Оплата позже, сейчас без списаний</p>
      </div>
    </article>
  );
}

function SenseiCharacterCard({
  busy,
  canAfford,
  disabled,
  item,
  onPurchase,
  onSelect,
  owned,
  selected,
}: {
  busy: boolean;
  canAfford: boolean;
  disabled: boolean;
  item: SenseiCharacterShopItem;
  onPurchase: () => void;
  onSelect: () => void;
  owned: boolean;
  selected: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-purple-energy/35 bg-gradient-to-br from-card via-background-mid to-popover p-5 shadow-[0_26px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-purple-energy/60 md:p-6">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-purple-energy/85 to-transparent" />
      <div className="absolute right-0 top-0 size-44 rounded-full bg-purple-energy/18 blur-3xl" />
      <div className="relative grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-primary/20 bg-black/25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,107,53,0.16),transparent_44%),radial-gradient(circle_at_50%_78%,rgba(108,99,255,0.18),transparent_48%)]" />
          <Image
            src={item.image}
            alt={item.title}
            width={280}
            height={360}
            className="relative mx-auto h-[280px] w-auto object-contain drop-shadow-[0_22px_55px_rgba(0,0,0,0.58)] transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {owned ? (
              <Badge className="rounded-lg border border-green-success/30 bg-green-success/12 text-green-success">
                Куплено
              </Badge>
            ) : null}
            {selected ? (
              <Badge variant="premium" className="rounded-lg">
                Выбран
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-energy">Премиальный сенсей</p>
          <h3 className="mt-2 font-display text-4xl font-black uppercase tracking-[0.04em] text-foreground">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">{item.description}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-purple-energy/25 bg-purple-energy/10 px-4 py-3 font-display text-2xl font-black text-purple-energy">
            <Gem className="size-5" fill="currentColor" />
            {currencyFormatter.format(item.priceGems)}
          </div>
          <Button
            className="mt-5 w-full sm:w-auto"
            disabled={disabled || selected}
            variant={owned && !selected ? "outline" : "default"}
            onClick={owned ? onSelect : onPurchase}
          >
            {busy ? (
              "Обновляем..."
            ) : selected ? (
              <>
                <Check className="size-4" />
                Выбран
              </>
            ) : owned ? (
              "Выбрать"
            ) : canAfford ? (
              `Купить за ${currencyFormatter.format(item.priceGems)} 💎`
            ) : (
              "Недостаточно самоцветов"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ConsumablePackCard({
  canAfford,
  disabled,
  item,
  onPurchase,
  purchased,
  purchasing,
  variant,
}: {
  canAfford: boolean;
  disabled: boolean;
  item: HintShopItem | UndoShopItem;
  onPurchase: () => void;
  purchased: boolean;
  purchasing: boolean;
  variant: "hint" | "undo";
}) {
  const Icon = variant === "hint" ? Lightbulb : RotateCcw;
  const label = variant === "hint" ? "подсказок" : "отмен";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/88 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl transition md:p-5",
        item.featured ? "border-primary/45 shadow-[0_0_38px_rgba(255,107,53,0.13)]" : "border-primary/15",
      )}
    >
      <div className="absolute right-0 top-0 size-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-12 place-items-center rounded-xl border border-primary/25 bg-primary/12 text-primary">
            <Icon className="size-6" />
          </div>
          {item.featured ? (
            <Badge variant="premium" className="rounded-lg">
              Featured
            </Badge>
          ) : null}
        </div>
        <h3 className="mt-4 font-display text-2xl font-black uppercase tracking-[0.04em] text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{item.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-primary/12 bg-popover/70 px-3 py-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Coins className="size-4 text-gold" fill="currentColor" />
            {currencyFormatter.format(item.priceCoins)}
          </div>
          <p className="text-xs font-bold text-purple-energy">
            +{item.quantity ?? 0} {label}
          </p>
        </div>
        <Button
          className="mt-4 w-full"
          variant={item.featured ? "default" : "outline"}
          disabled={disabled || !canAfford}
          onClick={onPurchase}
        >
          {purchased ? (
            <>
              <Check className="size-4" />
              Куплено
            </>
          ) : purchasing ? (
            "Покупка..."
          ) : canAfford ? (
            "Купить"
          ) : (
            "Не хватает монет"
          )}
        </Button>
      </div>
    </article>
  );
}
