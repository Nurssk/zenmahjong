import type {
  CoinShopItem,
  GemShopItem,
  HintShopItem,
  SenseiCharacterShopItem,
  ShopItem,
  UndoShopItem,
} from "@/src/lib/economy/economy-types";

export const HINT_PACKS: HintShopItem[] = [
  {
    id: "hints_3",
    title: "3 подсказки",
    description: "Небольшой набор для спокойной игры",
    type: "hints",
    quantity: 3,
    priceCoins: 250,
  },
  {
    id: "hints_10",
    title: "10 подсказок",
    description: "Лучший выбор для длинных партий",
    type: "hints",
    quantity: 10,
    priceCoins: 700,
    featured: true,
  },
  {
    id: "hints_25",
    title: "25 подсказок",
    description: "Запас для турниров и ежедневных испытаний",
    type: "hints",
    quantity: 25,
    priceCoins: 1500,
  },
];

export const COIN_PACKS: CoinShopItem[] = [
  {
    id: "coins_100",
    title: "100 монет",
    description: "Быстрый набор для покупки подсказок",
    type: "coins",
    coins: 100,
    priceKzt: 490,
    demoPaymentOnly: true,
  },
  {
    id: "coins_500",
    title: "500 монет",
    description: "Популярный набор для активной игры",
    type: "coins",
    coins: 500,
    priceKzt: 800,
    featured: true,
    demoPaymentOnly: true,
  },
  {
    id: "coins_1000",
    title: "1000 монет",
    description: "Максимальный набор для турниров и подсказок",
    type: "coins",
    coins: 1000,
    priceKzt: 1500,
    demoPaymentOnly: true,
  },
];

export const GEM_PACKS: GemShopItem[] = [
  {
    id: "gems_50",
    title: "50 самоцветов",
    description: "Премиальная валюта для будущих возможностей",
    type: "gems",
    gems: 50,
    priceKzt: 990,
    demoPaymentOnly: true,
  },
  {
    id: "gems_150",
    title: "150 самоцветов",
    description: "Лучший стартовый набор самоцветов",
    type: "gems",
    gems: 150,
    priceKzt: 2490,
    featured: true,
    demoPaymentOnly: true,
  },
  {
    id: "gems_400",
    title: "400 самоцветов",
    description: "Максимальный премиум-набор",
    type: "gems",
    gems: 400,
    priceKzt: 5990,
    demoPaymentOnly: true,
  },
];

export const UNDO_PACKS: UndoShopItem[] = [
  {
    id: "undos_3",
    title: "3 отмены",
    description: "Верните несколько неудачных ходов",
    type: "undos",
    quantity: 3,
    priceCoins: 120,
  },
  {
    id: "undos_10",
    title: "10 отмен",
    description: "Запас для спокойной игры",
    type: "undos",
    quantity: 10,
    priceCoins: 320,
    featured: true,
  },
  {
    id: "undos_25",
    title: "25 отмен",
    description: "Для длинных партий и тренировок",
    type: "undos",
    quantity: 25,
    priceCoins: 750,
  },
];

export const SENSEI_CHARACTER_ITEMS: SenseiCharacterShopItem[] = [
  {
    id: "sensei_ugway",
    title: "Угвей",
    description: "Мудрый наставник для спокойной и стратегической игры.",
    type: "sensei_character",
    senseiId: "ugway",
    image: "/characters/ugway/ugway_normal.png",
    priceGems: 1000,
    currency: "gems",
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  ...COIN_PACKS,
  ...GEM_PACKS,
  ...SENSEI_CHARACTER_ITEMS,
  ...HINT_PACKS,
  ...UNDO_PACKS,
];
