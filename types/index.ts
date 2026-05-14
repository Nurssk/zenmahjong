export type PlayerLevel = "beginner" | "amateur" | "pro";
export type TrainerId = "airo" | "vega" | "blitz";
export type BoardSkinId = "shadow" | "sakura" | "white";
export type GameMode = "full" | "half" | "endgame" | "daily";
export type GameStatus = "playing" | "won" | "lost" | "paused";

export type Tile = {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  removed: boolean;
};

export type GameState = {
  id: string;
  mode: GameMode;
  tiles: Tile[];
  selectedTiles: string[];
  removedPairs: string[][];
  score: number;
  time: number;
  hints: number;
  undo: number;
  shuffle: number;
  status: GameStatus;
};

export type Trainer = {
  id: TrainerId;
  name: string;
  title: string;
  tone: string;
  quote: string;
  accent: string;
  unlock: string;
};

export type BoardSkin = {
  id: BoardSkinId;
  name: string;
  description: string;
  palette: string;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  playerLevel: PlayerLevel;
  selectedTrainer: TrainerId;
  selectedBoardSkin: BoardSkinId;
  coins: number;
  gems: number;
  createdAt: string;
  onboardingCompleted: boolean;
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  bestTime: string;
  totalScore: number;
  totalWins: number;
  dailyTournamentWins: number;
};

export type Inventory = {
  hints: number;
  undo: number;
  shuffle: number;
  coachHelp: number;
  trainers: TrainerId[];
  boardSkins: BoardSkinId[];
  packs: string[];
};

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  country: string;
  city: string;
  score: number;
  time: string;
  streak: number;
  isCurrentUser?: boolean;
};

export type DailyQuest = {
  id: string;
  title: string;
  progress: number;
  target: number;
  reward: string;
};

export type ShopItem = {
  id: string;
  name: string;
  category: "coins" | "gems" | "trainer" | "skin" | "consumable" | "pack";
  price: string;
  description: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
};
