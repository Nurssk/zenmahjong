Да. Фиксируем архитектуру проекта.

# Zen Mahjong — Architecture
## 1. Tech Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Firebase Auth
- Firestore
- Vercel
---
## 2. App Routes
```text
/
 /login
 /register
 /onboarding
 /tutorial
 /dashboard
 /game
 /leaderboard
 /stats
 /shop
 /battle-pass
 /profile

⸻

3. Project Structure

zen-mahjong/
├─ app/
│  ├─ page.tsx
│  ├─ login/page.tsx
│  ├─ register/page.tsx
│  ├─ onboarding/page.tsx
│  ├─ tutorial/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ game/page.tsx
│  ├─ leaderboard/page.tsx
│  ├─ stats/page.tsx
│  ├─ shop/page.tsx
│  ├─ battle-pass/page.tsx
│  └─ profile/page.tsx
│
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ auth/
│  ├─ onboarding/
│  ├─ dashboard/
│  ├─ game/
│  ├─ coach/
│  ├─ leaderboard/
│  ├─ stats/
│  ├─ shop/
│  └─ battle-pass/
│
├─ lib/
│  ├─ firebase/
│  ├─ game-engine/
│  ├─ economy/
│  ├─ coach/
│  ├─ leaderboard/
│  └─ utils/
│
├─ hooks/
├─ types/
├─ constants/
└─ styles/

⸻

4. Core Modules

Auth Module

Отвечает за:

* login;
* register;
* logout;
* Firebase user;
* protected routes.

Onboarding Module

Отвечает за:

* выбор уровня;
* выбор тренера;
* выбор скина;
* сохранение настроек пользователя.

Game Engine Module

Отвечает за:

* генерацию поля;
* проверку свободных плиток;
* удаление пар;
* hint;
* undo;
* shuffle;
* победу/поражение.

AI Coach Module

Отвечает за:

* стиль речи тренера;
* советы;
* tutorial messages;
* предупреждения;
* анализ лучшего хода.

Dashboard Module

Отвечает за:

* new game;
* continue last game;
* stats preview;
* quests preview;
* battle pass preview.

Economy Module

Отвечает за:

* coins;
* gems;
* покупку hint/undo;
* packs;
* premium mock.

Leaderboard Module

Отвечает за:

* daily tournament;
* global ranking;
* Kazakhstan ranking;
* city ranking.

⸻

5. Main Data Types

type PlayerLevel = "beginner" | "amateur" | "pro"
type TrainerId = "airo" | "vega"
type BoardSkinId = "shadow" | "sakura" | "white"
type GameMode = "full" | "daily"
type Tile = {
  id: string
  type: string
  x: number
  y: number
  z: number
  removed: boolean
}
type GameState = {
  id: string
  mode: GameMode
  tiles: Tile[]
  selectedTiles: string[]
  removedPairs: string[][]
  score: number
  time: number
  hints: number
  undo: number
  shuffle: number
  status: "playing" | "won" | "lost" | "paused"
}

⸻

6. Firebase Structure

users/{uid}
  displayName
  email
  playerLevel
  selectedTrainer
  selectedBoardSkin
  coins
  gems
  createdAt
  onboardingCompleted
users/{uid}/stats/main
  gamesPlayed
  wins
  losses
  winRate
  currentStreak
  bestTime
  totalScore
users/{uid}/inventory/main
  hints
  undo
  shuffle
  trainers[]
  boardSkins[]
  packs[]
users/{uid}/lastGame/main
  gameState
  updatedAt
users/{uid}/gameHistory/{gameId}
  mode
  score
  time
  won
  createdAt
dailyChallenges/{date}
  seed
  layout
  createdAt
dailyChallenges/{date}/results/{uid}
  displayName
  country
  city
  score
  time
  completedAt

⸻

7. Game Engine Files

lib/game-engine/
├─ types.ts
├─ layouts.ts
├─ generateBoard.ts
├─ isTileFree.ts
├─ findAvailablePairs.ts
├─ canRemovePair.ts
├─ removePair.ts
├─ undoMove.ts
├─ shuffleTiles.ts
├─ calculateScore.ts
└─ checkGameStatus.ts

⸻

8. Component Map

Landing

HeroSection
FeatureCards
TrainerPreview
TournamentPreview
CTASection

Auth

LoginForm
RegisterForm
AuthCard
GoogleButton

Onboarding

LevelSelect
TrainerSelect
BoardSkinSelect
OnboardingProgress

Dashboard

DashboardHeader
PlayCard
ContinueGameCard
StatsPreview
DailyQuestCard
BattlePassCard
TournamentCard
ShopPreview

Game

GameHeader
MahjongBoard
MahjongTile
GameActions
Timer
ScorePanel
CoachPanel
PauseMenu

Leaderboard

LeaderboardTabs
LeaderboardTable
RankingCard
PlayerRankCard

Shop

ShopTabs
CurrencyCard
PackCard
TrainerCard
SkinCard

⸻

9. Development Order

1. Project setup
2. Design tokens
3. Layout components
4. Auth pages
5. Onboarding pages
6. Dashboard UI
7. Mahjong engine
8. Game screen
9. Tutorial
10. Firebase save/load
11. Leaderboard
12. Stats
13. Shop mock
14. Battle Pass mock
15. Polish + animations
16. README + deploy

⸻

10. MVP Rule

Сейчас делаем рабочими:

Auth
Onboarding
Tutorial
Game
Hint
Undo
Score
Timer
Dashboard
Leaderboard
Stats

Как mock/UI делаем:

Shop
Packs
Battle Pass
Premium
Payments