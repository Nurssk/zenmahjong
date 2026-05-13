# Component Reference Guide

Complete index of all components in the Zen Mahjong application.

---

## 📁 Main Components (Screens)

### LandingPage.tsx
**Path**: `src/app/components/LandingPage.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Epic hero landing page with cinematic introduction

**Sub-components**:
- `FeatureCard` - Displays tournament/trainer/battle pass features
  - Props: `icon, title, description, delay`
  - Entrance animation with stagger

**Key Features**:
- Animated particle background (30 particles)
- Glowing ZEN MAHJONG title with motion blur
- Large PLAY NOW CTA with gradient glow
- 3 feature preview cards
- Sign In / Create Account buttons
- Radial gradient ambient lighting

**Animations**:
- Title fade in + slide up
- CTA scale + fade in
- Feature cards staggered entrance
- Particles infinite pulse + scale
- Background radial glow

**Navigation**:
- "PLAY NOW" → Dashboard
- "Sign In" → Login Screen
- "Create Account" → Login Screen

---

### LoginScreen.tsx
**Path**: `src/app/components/LoginScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Modern authentication screen

**State**:
- `isSignUp: boolean` - Toggle between sign-in and sign-up

**Key Features**:
- Google Sign In button with brand colors
- Email input with Mail icon
- Password input with Lock icon
- Glassmorphism card effect
- Glow ring on input focus
- Back button to landing
- Toggle sign-up/sign-in text

**Animations**:
- Card scale + fade entrance
- Background radial glow

**Navigation**:
- "Sign In" → Onboarding Screen
- "Create Account" → Onboarding Screen
- "Back" → Landing Page

---

### OnboardingScreen.tsx
**Path**: `src/app/components/OnboardingScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: 3-step personalized setup flow

**State**:
- `step: number` - Current step (1-3)
- `selectedLevel: string` - Novice/Apprentice/Master
- `selectedTrainer: string` - AI trainer selection
- `selectedSkin: string` - Board skin selection

**Key Features**:
- Progress bar (3 segments)
- Step 1: Level selection (3 cards)
- Step 2: Trainer selection (4 trainers)
- Step 3: Board skin selection (3 skins)
- Checkmark on selected items
- "Continue" / "Begin Training" button

**Animations**:
- Step content fade + slide entrance
- Progress bar smooth fill

**Navigation**:
- Steps 1-2: "Continue" → Next step
- Step 3: "Begin Training" → Tutorial

---

### TutorialScreen.tsx
**Path**: `src/app/components/TutorialScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Interactive 4-step game tutorial

**State**:
- `step: number` - Current tutorial step (0-3)

**Sub-components**:
- `BoardPreview` - Shows Mahjong board layout
- `TilesMatchingPreview` - Demonstrates tile matching
- `ToolsPreview` - Shows hint/undo/shuffle tools
- `TrainerPreview` - Introduces AI trainer
- `ToolCard` - Individual tool explanation card
- `DialogueBubble` - Trainer dialogue with animation

**Key Features**:
- 4 tutorial steps with visual demonstrations
- Progress dots indicator
- Back/Next navigation
- Skip tutorial option
- Atmospheric particle background

**Steps**:
1. Welcome & board introduction
2. Matching identical tiles
3. Using tools (hint, undo, shuffle)
4. Training with AI masters

**Animations**:
- Content fade + slide on step change
- Visual previews scale entrance
- Dialogue bubbles staggered entrance
- Particle system (30 particles)

**Navigation**:
- "Next" → Next step
- "Back" → Previous step
- "Let's Play" (final step) → Dashboard
- "Skip tutorial" → Dashboard

---

### Dashboard.tsx
**Path**: `src/app/components/Dashboard.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Central hub and main navigation

**Sub-components**:
- `ActionCard` - Quick action tiles
  - Props: `icon, title, subtitle, badge?, onClick`
- `QuestItem` - Daily quest progress
  - Props: `title, progress, total, reward, completed?`
- `StatBox` - Stat display
  - Props: `label, value, icon?`

**Key Features**:
- Sticky header with branding + currency
- Large PLAY NOW button (gradient glow)
- Continue Game card
- Daily Tournament card (with countdown)
- Daily Quests section (3/5 example)
- Battle Pass preview (Level 8, 82% progress)
- Stats preview (Win Rate, Streak, Games, Rank)
- Shop CTA

**Layout**:
- Header: Sticky, backdrop blur
- Main: 3-column grid on desktop (2+1)
- Left: Play CTA, quick actions, quests
- Right: Battle pass, stats, shop

**Animations**:
- Play button hover glow increase
- Cards hover border intensify

**Navigation**:
- "PLAY NOW" → Game Screen
- "Continue Game" → Game Screen
- "Daily Tournament" → Tournament Screen
- "Battle Pass" → Battle Pass Screen
- "Stats" → Statistics Screen
- "Shop" → Shop Screen

---

### GameScreen.tsx
**Path**: `src/app/components/GameScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Main Mahjong gameplay experience

**State**:
- `selectedTiles: number[]` - Currently selected tiles
- `isPaused: boolean` - Game pause state
- `timeElapsed: number` - Timer in seconds

**Sub-components**:
- `MahjongTile` - Individual tile component
  - Props: `tile, isSelected, onClick`
  - Hover scale + lift effect
  - Selected glow effect
- `ActionButton` - Tool buttons (Hint, Undo, Shuffle)
  - Props: `icon, label, count`

**Key Features**:
- 8x8 grid of Mahjong tiles
- Atmospheric particle background (20 particles)
- Timer display (mm:ss format)
- Score display
- Progress bar (20/144 matched)
- Pause/Play button
- Action buttons with use counts
- AI Trainer panel with:
  - Trainer avatar with pulsing glow
  - Real-time dialogue
  - Match history (last 3 matches)
  - Combo meter (x3 with pulse animation)

**Tile Symbols**: 🀀 🀁 🀂 🀃 🀄 🀅 🀆

**Animations**:
- Particles infinite pulse
- Tile hover: scale 1.05, lift -4px
- Tile tap: scale 0.95
- Selected tile glow + shadow
- Progress bar smooth width change
- Combo meter pulse animation
- Trainer avatar glow pulse (2s loop)

**Navigation**:
- "Exit" → Dashboard
- "Test Victory" → Victory Screen (dev helper)

---

### VictoryScreen.tsx
**Path**: `src/app/components/VictoryScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Dramatic win celebration

**Sub-components**:
- `StatCard` - Performance stat display
  - Props: `icon, label, value, delay`
- `RewardCard` - Reward item display
  - Props: `icon, label, value`

**Key Features**:
- Trophy icon with pulsing glow
- "VICTORY" gradient text
- Performance stats (Time, Score, Accuracy, Rank)
- Rewards earned (Coins, Gems, XP)
- Quests completed section
- Play Again / Dashboard buttons
- Particle celebration (50 particles)

**Animations**:
- Screen fade + scale entrance
- Trophy rotate + scale spring animation
- Stats staggered entrance (0.1s delay each)
- Rewards fade in (0.9s delay)
- Particles float up + fade

**Navigation**:
- "Play Again" → Game Screen
- "Dashboard" → Dashboard

---

### TournamentScreen.tsx
**Path**: `src/app/components/TournamentScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Competitive leaderboards

**Sub-components**:
- `InfoCard` - Tournament info display
  - Props: `icon, label, value`
- `PrizeCard` - Prize tier display
  - Props: `rank, prize, icon, gradient`
- `LeaderboardRow` - Player ranking row
  - Props: `player: { rank, name, score, country?, city?, you }`

**Key Features**:
- Tournament header with "LIVE" badge
- Info cards (Time Remaining, Participants, Prize Pool)
- Prize preview (Top 3 with crown/medals)
- Global Rankings (top 8)
- Kazakhstan Rankings (top 3)
- Current player highlighted
- Join Tournament CTA

**Mock Data**:
- Global: 8 players with flags
- Kazakhstan: 3 players with cities
- Player rank #4 globally, #1 in Kazakhstan

**Animations**:
- Leaderboard rows stagger in (0.05s delay each)
- CTA button fade + slide up

**Navigation**:
- "Back" → Dashboard
- "Join Tournament" → Game Screen

---

### StatisticsScreen.tsx
**Path**: `src/app/components/StatisticsScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Performance tracking with charts

**Sub-components**:
- `KeyStatCard` - Key metric display
  - Props: `icon, label, value, change, positive?`
- `StatRow` - Stat row in cards
  - Props: `label, value, badge?, highlight?`
- `AchievementBadge` - Achievement display
  - Props: `icon, title, description, unlocked?, locked?`

**Key Features**:
- 4 key stats cards (Games, Win Rate, Streak, Rank)
- Weekly Performance line chart (Recharts)
- Win Rate Trend bar chart (Recharts)
- Playtime stats
- Best Records
- Rankings (Global, Regional, Friends)
- Recent Achievements (4 badges)

**Charts**:
- Line chart: 7 days of performance data
- Bar chart: 4 weeks of win rate trend
- Orange color scheme (#ff8800)
- Dark tooltip styling

**Mock Data**:
- 234 total games, 68% win rate
- 5-win streak, rank #142
- 42h 18m total playtime

**Animations**:
- Key stat cards staggered entrance
- Charts animate on mount

**Navigation**:
- "Back" → Dashboard

---

### ShopScreen.tsx
**Path**: `src/app/components/ShopScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Premium content marketplace

**Sub-components**:
- `TrainerPreview` - Small trainer card (3x3 grid)
- `ShopItemCard` - Individual shop item
  - Props: `title, description, price, currency, rarity`
  - Rarity: common, rare, epic, legendary
- `CurrencyPack` - Currency bundle card
  - Props: `title, coins, gems, price, popular?`

**Key Features**:
- Currency balance header (Coins + Gems)
- Featured bundle (Legendary Trainer Bundle)
  - 3 trainer previews
  - 499 gems (was 799)
  - Purple premium styling
- Categories:
  - AI Trainers (4 items, gem currency)
  - Board Skins (4 items, coin currency)
  - Currency Packs (3 tiers, $4.99-$29.99)
- Rarity-based styling
- Individual "Buy" buttons

**Rarity Colors**:
- Common: Gray (#gray-500/20)
- Rare: Blue (#blue-500/20)
- Epic: Purple (#purple-500/20)
- Legendary: Orange (#ff8800/20)

**Animations**:
- Featured bundle fade + slide up
- Item cards hover glow

**Navigation**:
- "Back" → Dashboard

---

### BattlePassScreen.tsx
**Path**: `src/app/components/BattlePassScreen.tsx`  
**Props**: `{ onNavigate: (screen: string) => void }`

**Purpose**: Seasonal progression rewards

**Sub-components**:
- `RewardTier` - Individual level rewards
  - Props: `level, freeReward, premiumReward, unlocked, current`
  - Shows both free and premium tracks

**Key Features**:
- Season header (Season 1: Shadow Warriors)
- Progress bar (Level 8, 2450/3000 XP)
- Time remaining (23 days)
- Premium Pass upsell card:
  - Benefits checklist (4 items)
  - $9.99 (50% off)
  - Purple gradient styling
- Rewards track (12 levels):
  - Free pass (orange)
  - Premium pass (purple)
  - Current level highlighted
  - Locked/Unlocked states
- Featured reward (Level 10: Void Master trainer)

**Mock Rewards**:
- Level 1: 100 coins / 50 gems
- Level 2: Tile skin / Avatar
- Level 8: Quest / Mystery Box (current)
- Level 10: Skin / AI Trainer
- Level 12: Trophy / Legendary Frame

**Animations**:
- Progress bar animate width (1s)
- Particle background (20 particles purple/orange)
- Featured reward fade + slide up

**Navigation**:
- "Back" → Dashboard
- "Get Premium Pass" → (Payment flow, not implemented)

---

## 🎨 Reusable Patterns

### Button Patterns

#### Primary CTA
```tsx
<button className="px-8 py-4 bg-gradient-to-r from-[#ff8800] 
  to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] 
  transition-all">
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-[#1f1f1f] border border-[#ff8800]/30 
  rounded-xl hover:bg-[#252525] transition-all">
  Button Text
</button>
```

### Card Patterns

#### Standard Card
```tsx
<div className="p-6 bg-[#151515] border border-[#ff8800]/20 
  rounded-xl hover:border-[#ff8800]/40 transition-all">
  {/* Content */}
</div>
```

#### Glowing Card
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-b 
    from-[#ff8800]/20 to-transparent rounded-xl blur-xl" />
  <div className="relative p-6 bg-[#151515] border 
    border-[#ff8800]/30 rounded-xl">
    {/* Content */}
  </div>
</div>
```

### Progress Bar Pattern
```tsx
<div className="h-2 bg-[#252525] rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-[#ff8800] 
    to-[#ff6600]" style={{ width: '60%' }} />
</div>
```

### Currency Display Pattern
```tsx
<div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] 
  border border-[#ff8800]/30 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-gradient-to-br 
    from-[#ffaa00] to-[#ff6600]" />
  <span className="font-bold">2,450</span>
</div>
```

### Stat Box Pattern
```tsx
<div className="p-3 bg-[#1a1a1a] rounded-lg">
  <p className="text-xs text-[#888888] mb-1">Label</p>
  <p className="text-xl font-bold">Value</p>
</div>
```

---

## 🎭 Animation Patterns

### Entrance Animation
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

### Staggered List
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    {/* Content */}
  </motion.div>
))}
```

### Hover Effects
```tsx
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.98 }}
```

### Infinite Pulse
```tsx
animate={{
  opacity: [0.2, 0.6, 0.2],
  scale: [1, 1.5, 1],
}}
transition={{
  duration: 3,
  repeat: Infinity,
}}
```

---

## 🎨 Icon Usage

### Common Icons (from lucide-react)
- `Play` - Play buttons
- `Trophy` - Tournaments, achievements
- `Star` - Gems, premium content
- `Crown` - Premium, #1 rank, battle pass
- `Flame` - Streak, hot/active
- `Target` - Quests, accuracy
- `TrendingUp` - Statistics, growth
- `ShoppingBag` - Shop
- `Zap` - Energy, XP
- `Clock` - Timer, countdown
- `Users` - Participants
- `Medal` - Rank 2-3
- `ArrowLeft` - Back navigation
- `Lightbulb` - Hint
- `RotateCcw` - Undo
- `Shuffle` - Shuffle
- `Check` - Completed, selected
- `Lock` - Locked content

### Icon Sizes
```tsx
<Icon className="w-4 h-4" />  // 16px - Small
<Icon className="w-5 h-5" />  // 20px - Medium
<Icon className="w-6 h-6" />  // 24px - Standard
<Icon className="w-8 h-8" />  // 32px - Large
```

---

## 📊 Data Structures

### Player Data
```typescript
interface Player {
  rank: number;
  name: string;
  score: number;
  country?: string;  // For global leaderboard
  city?: string;     // For regional leaderboard
  you: boolean;      // Highlight current player
}
```

### Quest Data
```typescript
interface Quest {
  title: string;
  progress: number;
  total: number;
  reward: number;
  completed?: boolean;
}
```

### Reward Data
```typescript
interface Reward {
  level: number;
  free: string;      // Free pass reward
  premium: string;   // Premium pass reward
  unlocked: boolean;
}
```

### Shop Item Data
```typescript
interface ShopItem {
  title: string;
  description: string;
  price: number;
  currency: 'coin' | 'gem';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

---

## 🎯 Navigation Props

All screen components share the same prop interface:
```typescript
interface ScreenProps {
  onNavigate: (screen: string) => void;
}
```

### Valid Screen IDs
- `'landing'` - Landing Page
- `'login'` - Login Screen
- `'onboarding'` - Onboarding Flow
- `'tutorial'` - Tutorial
- `'dashboard'` - Dashboard
- `'game'` - Game Screen
- `'victory'` - Victory Screen
- `'tournament'` - Tournament
- `'stats'` - Statistics
- `'shop'` - Shop
- `'battlepass'` - Battle Pass

---

## 📦 Component Export Summary

### Main Screens (11 total)
```typescript
export { LandingPage } from './components/LandingPage';
export { LoginScreen } from './components/LoginScreen';
export { OnboardingScreen } from './components/OnboardingScreen';
export { TutorialScreen } from './components/TutorialScreen';
export { Dashboard } from './components/Dashboard';
export { GameScreen } from './components/GameScreen';
export { VictoryScreen } from './components/VictoryScreen';
export { TournamentScreen } from './components/TournamentScreen';
export { StatisticsScreen } from './components/StatisticsScreen';
export { ShopScreen } from './components/ShopScreen';
export { BattlePassScreen } from './components/BattlePassScreen';
```

### Internal Sub-components
Most sub-components are not exported and only used within their parent component file.

---

## 🎨 Style Consistency

### Border Radius Scale
- `rounded` - 0.25rem (4px)
- `rounded-lg` - 0.5rem (8px)
- `rounded-xl` - 0.75rem (12px)
- `rounded-2xl` - 1rem (16px)
- `rounded-3xl` - 1.5rem (24px)
- `rounded-full` - 9999px (circle)

### Common Spacings
- Gap between cards: `gap-4` or `gap-6`
- Padding inside cards: `p-4` or `p-6`
- Screen padding: `px-4 py-8`
- Button padding: `px-6 py-3` or `px-8 py-4`

### Transition Patterns
- Standard: `transition-all`
- Colors only: `transition-colors`
- Duration: Default 150ms (built into Tailwind)

---

**Component Count**: 11 main screens + 25+ sub-components  
**Total Lines of Code**: ~3,500 lines  
**Animation Count**: 50+ unique animations  
**Icon Usage**: 25+ unique Lucide icons
