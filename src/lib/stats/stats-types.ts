export type GameResultStatus = "won" | "lost" | "unfinished";

export type GameMode = "regular" | "daily" | "tournament";

export type GameDifficulty = "easy" | "medium" | "hard";

export type GameResultReason = "win" | "no_moves" | "new_game" | "exit" | "restart";

export type GameResult = {
  id: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  status: GameResultStatus;
  score: number;
  timeSeconds: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  maxCombo?: number;
  hintsUsed?: number;
  undoUsed?: number;
  startedAt: string;
  endedAt: string;
  date: string;
  reason: GameResultReason;
  completed: boolean;
  won: boolean;
};

export type PlayerStatsSummary = {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesUnfinished: number;
  completedGames: number;
  winRate: number;
  bestScore: number;
  averageScore: number;
  bestTimeSeconds: number | null;
  averageTimeSeconds: number | null;
  totalPlayTimeSeconds: number;
  averageMoves: number;
  bestCombo: number;
  currentStreak: number;
  focusScore: number;
};

export type WeeklyActivityPoint = {
  day: string;
  games: number;
  wins: number;
  score: number;
};

export type ScoreTrendPoint = {
  label: string;
  score: number;
  result: GameResultStatus;
};

export type BreakdownPoint = {
  label: string;
  value: number;
  percentage: number;
};

export type StatsDataSource = "firestore" | "local" | "demo" | "local-with-demo-fallback";

export type StatsDashboardData = {
  source: StatsDataSource;
  results: GameResult[];
  summary: PlayerStatsSummary;
  recentGames: GameResult[];
  weeklyActivity: WeeklyActivityPoint[];
  scoreTrend: ScoreTrendPoint[];
  difficultyBreakdown: BreakdownPoint[];
  modeBreakdown: BreakdownPoint[];
  winLossBreakdown: BreakdownPoint[];
  totalHintsUsed: number;
  totalUndoUsed: number;
  regularSummary: PlayerStatsSummary;
  tournamentSummary: PlayerStatsSummary;
};
