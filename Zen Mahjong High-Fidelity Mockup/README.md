# 🎮 Zen Mahjong

A premium cinematic Mahjong solitaire game platform inspired by Shadow Fight 2's dark atmospheric aesthetic. Built with React, TypeScript, Tailwind CSS v4, and Motion (Framer Motion).

---

## ✨ Overview

**Zen Mahjong** is a next-generation puzzle game that transforms traditional Mahjong solitaire into an epic competitive experience. Featuring AI trainers, tournaments, seasonal battle passes, and a stunning dark cinematic UI.

### 🎯 Design Philosophy

- **Cinematic Dark Aesthetic**: Shadow Fight 2-inspired visuals
- **Glowing Orange/Amber Accents**: Premium energy aesthetic
- **Mysterious Oriental Atmosphere**: Martial arts mysticism
- **AAA Mobile Game Quality**: App Store/Steam-ready presentation
- **NOT Casino/Cartoonish**: Sophisticated, premium experience

---

## 🎬 Screens & Features

### 1. 🌟 Landing Page
**Purpose**: Epic hero introduction
- Cinematic animated background with floating particles
- Large glowing "PLAY NOW" CTA button
- Feature preview cards (Tournaments, AI Masters, Battle Pass)
- Sign In / Create Account options
- Radial gradient ambient lighting
- Motion-animated entrance

### 2. 🔐 Login / Register
**Purpose**: Modern authentication
- Dark elegant auth card with glassmorphism
- Google Sign In integration
- Email/Password fields with glowing borders
- Seamless sign-up/sign-in toggle
- Focus states with orange glow rings
- Back navigation to landing

### 3. 🎓 Onboarding (3 Steps)
**Purpose**: Personalized game setup
1. **Choose Your Path**: Novice / Apprentice / Master
2. **Choose Your Master**: Select AI trainer (4 options)
3. **Select Your Arena**: Board skin selection
- Progress indicator at top
- Visual selection with checkmarks
- Smooth step transitions
- "Begin Training" CTA

### 4. 📚 Tutorial
**Purpose**: Interactive game walkthrough
- 4-step guided tutorial
- Visual demonstrations for each concept
- Board preview, tile matching, tools, AI trainer intro
- Skip option available
- Progress dots indicator
- Smooth screen transitions

### 5. 🏠 Dashboard (Main Hub)
**Purpose**: Central navigation and quick actions
- **Large PLAY NOW button** - Primary CTA
- **Continue Game** - Resume progress
- **Daily Tournament** - Live tournament access with countdown
- **Daily Quests** - Progress tracking (3/5 complete example)
- **Battle Pass** - Season progress with XP bar
- **Your Stats** - Win rate, streak, games, rank preview
- **Shop** - Quick access to store
- Currency display (Coins & Gems)
- Sticky header with branding

### 6. 🎮 Game Screen
**Purpose**: Main Mahjong gameplay
- **Cinematic board** - 3D layered Mahjong tiles
- **Atmospheric particles** - Floating ambient effects
- **Timer** - Real-time game duration
- **Score display** - Current points
- **Progress bar** - Tiles matched (20/144)
- **Action buttons**:
  - Hint (3 uses)
  - Undo (5 uses)
  - Shuffle (2 uses)
- **AI Trainer panel**:
  - Shadow Master with pulsing glow
  - Real-time dialogue and tips
  - Match history
  - Combo meter (x3 multiplier)
- Tile hover effects with glow
- Smooth tile selection animations

### 7. 🏆 Victory Screen
**Purpose**: Dramatic win celebration
- Trophy icon with pulsing glow
- Animated particles celebration
- **Performance stats**:
  - Time: 4:32
  - Score: 2,450
  - Accuracy: 94%
  - Rank: S
- **Rewards earned**:
  - +250 Coins
  - +15 Gems
  - +500 XP
- **Quests completed** - With bonus XP
- Play Again / Back to Dashboard options
- Entrance animations with delays

### 8. 🏅 Tournament Screen
**Purpose**: Competitive leaderboards
- **Live tournament header** with countdown (2h 34m)
- **Tournament stats**:
  - 12,453 participants
  - 50,000 💎 prize pool
- **Prize preview** - Top 3 rewards display
- **Global Rankings** - Top 8 players worldwide
- **Kazakhstan Rankings** - Regional leaderboard
- Player cards with:
  - Rank badges (Crown for #1, Medals for #2-3)
  - Country flags
  - Score display
  - Highlighted "You" row
- "Join Tournament" CTA button

### 9. 📊 Statistics Screen
**Purpose**: Performance tracking & analytics
- **Key stats cards**:
  - Total Games: 234 (+12 this week)
  - Win Rate: 68% (+3% from last week)
  - Current Streak: 5 wins
  - Global Rank: #142 (↑ 8 positions)
- **Weekly Performance chart** - Line graph (Recharts)
- **Win Rate Trend chart** - Bar graph
- **Playtime stats**:
  - Total: 42h 18m
  - This Week: 5h 32m
  - Average/Day: 47m
  - Longest Session: 2h 15m
- **Best Records**:
  - Fastest Win: 3:24 ⭐
  - Highest Score: 3,850 ⭐
  - Perfect Games: 12
  - No-Hint Wins: 48
- **Rankings** - Global, Kazakhstan, Friends, Peak
- **Recent Achievements** - Badge showcase

### 10. 🛍️ Shop Screen
**Purpose**: Premium content marketplace
- **Currency display** - Coins & Gems balance
- **Featured bundle** - Legendary Trainer Bundle (Limited offer)
  - 3 exclusive AI trainers
  - 499 gems (was 799)
  - Purple premium styling
- **Categories**:
  - **AI Trainers** - 4 trainers with rarity tiers
  - **Board Skins** - 4 themes (Ember, Mystic, Jade, Shadow)
  - **Currency Packs** - 3 tiers ($4.99, $9.99, $29.99)
- Rarity-based borders (Common, Rare, Epic, Legendary)
- Individual "Buy" buttons
- Item cards with preview images

### 11. 👑 Battle Pass Screen
**Purpose**: Seasonal progression rewards
- **Season header**: "Season 1: Shadow Warriors"
- **Progress display**:
  - Level 8 (current)
  - 2,450 / 3,000 XP
  - Animated progress bar
  - 23 days remaining
- **Premium Pass upsell card**:
  - Benefits checklist
  - $9.99 (50% off launch discount)
  - Purple premium styling
- **Rewards track** (12 levels shown):
  - Free Pass rewards (left)
  - Premium Pass rewards (right)
  - Unlocked vs Locked states
  - Current level highlighted
  - Checkmarks for completed levels
- **Featured reward showcase**:
  - Level 10: Exclusive AI Trainer "Void Master"
  - Legendary rarity
  - Detailed description

---

## 🎨 Design System Highlights

### Color Palette
- **Primary**: #ff8800 (Orange/Amber)
- **Secondary**: #ff6600 (Orange Glow)
- **Gold**: #ffaa00 (Highlights)
- **Purple**: #aa44ff (Premium)
- **Background**: #0a0a0a → #151515 (Deep black gradient)
- **Text**: #e8e8e8 (High contrast)

### Typography
- **Font**: System UI (san-serif)
- **Headings**: 600 weight, gradient text effects
- **Body**: 400 weight, #e8e8e8

### Components
- **Buttons**: Gradient fills, glow shadows, rounded-xl
- **Cards**: Dark surfaces, orange borders, hover effects
- **Inputs**: Glowing focus rings, orange accents
- **Progress Bars**: Gradient fills, smooth animations

### Visual Effects
- **Glow**: `shadow-[0_0_30px_rgba(255,136,0,0.4)]`
- **Particles**: Animated floating elements
- **Gradients**: Orange/amber color combinations
- **Glassmorphism**: Backdrop blur with transparency

---

## 🛠️ Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (Framer Motion) 12.23.24
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React 0.487.0
- **Build Tool**: Vite 6.3.5
- **Package Manager**: pnpm

### Key Dependencies
```json
{
  "motion": "12.23.24",
  "lucide-react": "0.487.0",
  "recharts": "2.15.2",
  "react": "18.3.1"
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (1 column layouts)
- **Tablet**: 768px (2 column grids)
- **Desktop**: 1024px+ (3+ column grids)

### Mobile Optimizations
- Touch-friendly button sizes (44x44px minimum)
- Simplified layouts on small screens
- Full-width CTAs on mobile
- Reduced particle effects for performance
- Responsive grid patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 🎯 Navigation Flow

```
Landing Page
    ↓
Login Screen
    ↓
Onboarding (3 steps)
    ↓
Tutorial (4 steps)
    ↓
Dashboard ←→ Game Screen → Victory Screen
    ↓           ↑ (Play Again)
    ├─→ Tournament
    ├─→ Statistics  
    ├─→ Shop
    └─→ Battle Pass
```

All screens have back navigation to Dashboard or previous screen.

---

## 🎮 Game Features

### Core Gameplay
- **Mahjong Solitaire**: Match pairs of identical tiles
- **144 tiles** - Multiple layers and symbols
- **Tools**: Hint, Undo, Shuffle
- **Scoring**: Points, combos, time bonuses
- **Rank system**: S, A, B, C grades

### Progression Systems
1. **XP & Levels** - Earn XP from games
2. **Daily Quests** - Complete objectives for rewards
3. **Battle Pass** - Seasonal progression (Free + Premium)
4. **Tournaments** - Daily competitive events
5. **Statistics** - Track performance over time

### Monetization
- **Currency**: Coins (earned) & Gems (premium)
- **Shop**: Trainers, skins, packs
- **Battle Pass**: $9.99 seasonal subscription
- **Currency Packs**: $4.99 - $29.99

### Social Features
- **Global Leaderboards** - Worldwide rankings
- **Regional Leaderboards** - Kazakhstan example
- **Friends Leaderboards** - (Future feature)
- **Achievements** - Badge collection

---

## 🤖 AI Trainers System

### Trainer Personalities
1. **Shadow Master** - Aggressive, speed tactics
2. **Zen Sage** - Balanced, pattern recognition
3. **Fire Spirit** - Risky, bold moves
4. **Stone Guardian** - Defensive, strategic thinking

### Trainer Features
- **Real-time dialogue** - Strategic tips during gameplay
- **Personality-based advice** - Matches trainer style
- **Progression tracking** - Learn player patterns
- **Visual presence** - Pulsing glow, status indicators

---

## 🎨 Animation Showcase

### Motion Patterns Used
1. **Entrance animations**: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
2. **Hover effects**: `whileHover={{ scale: 1.05 }}`
3. **Tap feedback**: `whileTap={{ scale: 0.95 }}`
4. **Infinite loops**: Particle systems, glow pulses
5. **Staggered delays**: Sequential card reveals
6. **Spring animations**: Trophy entrance on victory

### Performance Optimizations
- Limit particle count (20-50 particles)
- Use `will-change` for GPU acceleration
- Debounce hover states
- Lazy load heavy screens

---

## 📂 Project Structure

```
/workspaces/default/code/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app with routing
│   │   └── components/
│   │       ├── LandingPage.tsx
│   │       ├── LoginScreen.tsx
│   │       ├── OnboardingScreen.tsx
│   │       ├── TutorialScreen.tsx
│   │       ├── Dashboard.tsx
│   │       ├── GameScreen.tsx
│   │       ├── VictoryScreen.tsx
│   │       ├── TournamentScreen.tsx
│   │       ├── StatisticsScreen.tsx
│   │       ├── ShopScreen.tsx
│   │       └── BattlePassScreen.tsx
│   └── styles/
│       ├── theme.css                  # Design tokens
│       └── fonts.css                  # Font imports
├── DESIGN_SYSTEM.md                   # Complete design system docs
├── README.md                          # This file
└── package.json                       # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Installation
```bash
# Install dependencies
pnpm install

# Start dev server (already running in Figma Make)
# Preview will automatically update
```

### Navigation
The app starts at the Landing Page. Click through the flow:
1. Click "PLAY NOW" or "Sign In"
2. Complete login/onboarding
3. Explore all screens from Dashboard

---

## 🎯 Key UI/UX Decisions

### Why Dark-Only Theme?
- Matches Shadow Fight 2 aesthetic
- Premium gaming atmosphere
- Easier to create glowing effects
- Reduces eye strain during long sessions
- Modern app design trend

### Why Orange/Amber Primary?
- Warm, energetic, martial arts fire
- High contrast on dark backgrounds
- Not overused in gaming (vs blue/green)
- Distinctive brand identity
- Shadow Fight 2 color palette

### Why No Traditional Mahjong Aesthetics?
- Differentiate from generic Mahjong games
- Appeal to modern gamers, not just puzzle enthusiasts
- Premium positioning vs casual apps
- International appeal vs traditional Chinese style

### Why AI Trainers?
- Adds narrative and personality
- Educational element (teaches strategy)
- Progression motivation
- Social-like interaction without multiplayer complexity
- Monetization opportunity (trainer packs)

---

## 🔮 Future Enhancements

### Planned Features
1. **Multiplayer** - Real-time battles
2. **Clans/Guilds** - Team competitions
3. **Story Mode** - Campaign with cutscenes
4. **More Trainers** - 12+ unique personalities
5. **Advanced Skins** - Animated board themes
6. **Spectator Mode** - Watch top players
7. **Replay System** - Review past games
8. **Social Sharing** - Victory screenshots
9. **Cross-platform** - iOS, Android, Web, Desktop

### Technical Improvements
1. **Backend Integration** - Supabase for persistence
2. **Real Leaderboards** - Live competitive rankings
3. **User Authentication** - Firebase/Supabase Auth
4. **Cloud Save** - Progress sync across devices
5. **Analytics** - Player behavior tracking
6. **A/B Testing** - Optimize monetization

---

## 🎨 Design Credits

### Inspiration Sources
- **Shadow Fight 2** - Core visual aesthetic
- **Genshin Impact** - Premium mobile UI patterns
- **Valorant** - Competitive progression systems
- **League of Legends** - Battle pass design
- **Chess.com** - AI trainer concept

### Visual References
- Cinematic martial arts films
- Chinese shadow puppetry
- Minimalist Japanese design
- Modern gaming UIs (2024-2026)

---

## 📄 License & Usage

This is a demonstration project created with Figma Make. All visual designs, component implementations, and documentation are original work created for this showcase.

**Not for commercial use without proper licensing.**

---

## 🙏 Acknowledgments

- **Figma Make** - For the development platform
- **Tailwind CSS** - For the styling system
- **Motion (Framer Motion)** - For animations
- **Lucide** - For the icon library
- **Recharts** - For data visualization

---

## 📞 Support & Contact

For questions about this design system or implementation:
- Review `DESIGN_SYSTEM.md` for complete specifications
- Check component source code for implementation details
- All components are fully documented with inline comments

---

**Version**: 1.0.0  
**Last Updated**: May 12, 2026  
**Status**: Complete MVP with 11 fully functional screens  
**Platform**: Figma Make × React × Tailwind × Motion
