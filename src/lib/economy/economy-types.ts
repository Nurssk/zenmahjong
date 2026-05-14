export type PlayerEconomy = {
  userId?: string;
  coins: number;
  gems: number;
  hints: number;
  undos: number;
  createdAt?: string;
  updatedAt: string;
};

export type ConsumableShopItem = {
  id: string;
  title: string;
  description: string;
  type: "hints" | "undos" | "theme" | "booster";
  quantity?: number;
  priceCoins: number;
  featured?: boolean;
};

export type CoinShopItem = {
  id: string;
  title: string;
  description: string;
  type: "coins";
  coins: number;
  priceKzt: number;
  featured?: boolean;
  demoPaymentOnly: true;
};

export type GemShopItem = {
  id: string;
  title: string;
  description: string;
  type: "gems";
  gems: number;
  priceKzt: number;
  featured?: boolean;
  demoPaymentOnly: true;
};

export type HintShopItem = ConsumableShopItem & { type: "hints" };
export type UndoShopItem = ConsumableShopItem & { type: "undos" };
export type DemoPaymentShopItem = CoinShopItem | GemShopItem;
export type ShopItem = ConsumableShopItem | DemoPaymentShopItem;
