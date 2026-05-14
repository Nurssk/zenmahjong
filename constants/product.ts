import type {
  BoardSkin,
  DailyQuest,
  GameMode,
  Inventory,
  LeaderboardEntry,
  PlayerLevel,
  PlayerStats,
  ShopItem,
  Trainer,
  UserProfile,
} from "@/types";

export const productName = "Zen Mahjong";

export const playerLevels: Array<{
  id: PlayerLevel;
  name: string;
  description: string;
  perks: string[];
}> = [
  {
    id: "beginner",
    name: "Новичок",
    description: "Для тех, кто только входит в мир маджонга.",
    perks: ["Живое обучение", "Простые расклады", "Подсказки ходов"],
  },
  {
    id: "amateur",
    name: "Ученик",
    description: "Для игроков, которые уже знают основы.",
    perks: ["Ежедневные испытания", "Прогресс заданий", "Базовые награды"],
  },
  {
    id: "pro",
    name: "Мастер",
    description: "Для тех, кто хочет темп, давление и рейтинг.",
    perks: ["Сложные расклады", "Меньше подсказок", "Соревновательный рейтинг"],
  },
];

export const trainers: Trainer[] = [
  {
    id: "airo",
    name: "Airo",
    title: "Сенсей спокойной концентрации",
    tone: "Мягкий, терпеливый и точный.",
    quote: "Не спеши. Сначала освободи верхние кости.",
    accent: "from-orange-400 to-amber-200",
    unlock: "Стартовый сенсей",
  },
  {
    id: "vega",
    name: "Vega",
    title: "Стратегический сенсей",
    tone: "Аналитичный, изящный и дальновидный.",
    quote: "Открой левый фланг. Он даст доступ к двум парам.",
    accent: "from-violet-400 to-fuchsia-200",
    unlock: "Открывается через прогресс",
  },
  {
    id: "blitz",
    name: "Blitz",
    title: "Сенсей боевого темпа",
    tone: "Резкий, прямой и быстрый.",
    quote: "Ты теряешь темп. Сейчас важен центр.",
    accent: "from-red-500 to-orange-300",
    unlock: "Редкий набор",
  },
];

export const boardSkins: BoardSkin[] = [
  {
    id: "shadow",
    name: "Zen Dark",
    description: "Премиальная темная доска со стеклом, дымом и угольным свечением.",
    palette: "Уголь, жар, фиолет",
  },
  {
    id: "sakura",
    name: "Sakura Pink",
    description: "Спокойный розово-белый скин для размеренной партии.",
    palette: "Роза, жемчуг, мягкое золото",
  },
  {
    id: "white",
    name: "White Minimal",
    description: "Чистая минимальная доска для светлого режима.",
    palette: "Слоновая кость, тушь, серебро",
  },
];

export const gameModes: Array<{
  id: GameMode;
  name: string;
  duration: string;
  description: string;
}> = [
  {
    id: "full",
    name: "Полная партия",
    duration: "12-18 мин",
    description: "Полный расклад для глубокого фокуса.",
  },
  {
    id: "half",
    name: "Быстрая партия",
    duration: "6-8 мин",
    description: "Старт с середины расклада для короткой сессии.",
  },
  {
    id: "endgame",
    name: "Финал",
    duration: "1-2 мин",
    description: "Почти завершенный расклад для быстрой победы.",
  },
  {
    id: "daily",
    name: "Ежедневный турнир",
    duration: "Один сид",
    description: "Одинаковый расклад и условия для всех игроков сегодня.",
  },
];

export const tutorialSteps = [
  "Добро пожаловать",
  "Как собрать пару",
  "Какие кости свободны",
  "Первый ход",
  "Второй ход",
  "Таймер",
  "Очки",
  "Подсказка",
  "Отмена",
  "Заверши сам",
  "Победа",
];

export const demoProfile: UserProfile = {
  uid: "demo",
  displayName: "Nursultan",
  email: "demo@zenmahjong.app",
  playerLevel: "amateur",
  selectedTrainer: "airo",
  selectedBoardSkin: "shadow",
  coins: 1280,
  gems: 84,
  createdAt: "2026-05-12",
  onboardingCompleted: true,
};

export const demoStats: PlayerStats = {
  gamesPlayed: 128,
  wins: 91,
  losses: 37,
  winRate: 71,
  currentStreak: 7,
  longestStreak: 18,
  bestTime: "02:14",
  totalScore: 82450,
  totalWins: 91,
  dailyTournamentWins: 6,
};

export const demoInventory: Inventory = {
  hints: 3,
  undo: 2,
  shuffle: 1,
  coachHelp: 1,
  trainers: ["airo"],
  boardSkins: ["shadow"],
  packs: ["daily-focus-pack"],
};

export const dailyQuests: DailyQuest[] = [
  { id: "q1", title: "Сыграй 3 партии", progress: 2, target: 3, reward: "120 монет" },
  { id: "q2", title: "Победи 1 раз", progress: 1, target: 1, reward: "1 подсказка" },
  { id: "q3", title: "Используй подсказку", progress: 0, target: 1, reward: "60 монет" },
];

export const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: 1,
    displayName: "VegaLine",
    country: "Казахстан",
    city: "Алматы",
    score: 18420,
    time: "02:02",
    streak: 21,
  },
  {
    rank: 2,
    displayName: "SilentDragon",
    country: "Казахстан",
    city: "Павлодар",
    score: 17310,
    time: "02:14",
    streak: 14,
    isCurrentUser: true,
  },
  {
    rank: 3,
    displayName: "AiroFocus",
    country: "Япония",
    city: "Киото",
    score: 16980,
    time: "02:27",
    streak: 12,
  },
  {
    rank: 4,
    displayName: "BlitzTempo",
    country: "Корея",
    city: "Сеул",
    score: 16240,
    time: "02:31",
    streak: 10,
  },
];

export const shopItems: ShopItem[] = [
  {
    id: "coins-1",
    name: "Монеты фокуса",
    category: "coins",
    price: "$1.99",
    description: "Быстрое пополнение для подсказок, отмен и наборов.",
    rarity: "common",
  },
  {
    id: "gems-1",
    name: "Тайник самоцветов",
    category: "gems",
    price: "$4.99",
    description: "Премиальная валюта для сенсеев и редких скинов.",
    rarity: "rare",
  },
  {
    id: "trainer-vega",
    name: "Vega",
    category: "trainer",
    price: "600 самоцветов",
    description: "Стратегический сенсей с тактическими советами.",
    rarity: "epic",
  },
  {
    id: "skin-sakura",
    name: "Sakura Pink",
    category: "skin",
    price: "420 самоцветов",
    description: "Более спокойный скин доски для ежедневной партии.",
    rarity: "rare",
  },
  {
    id: "rare-pack",
    name: "Набор Лунных врат",
    category: "pack",
    price: "900 монет",
    description: "Монеты, самоцветы, расходники и шанс на косметику.",
    rarity: "legendary",
  },
];
