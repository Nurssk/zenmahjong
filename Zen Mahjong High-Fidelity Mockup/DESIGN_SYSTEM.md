# Zen Mahjong Design System
## Shadow Fight 2-Inspired Premium Game UI

---

## 🎨 Color Palette

### Primary Colors
```
Orange/Amber (Primary Action)
--primary: #ff8800         HEX: #ff8800  RGB: 255, 136, 0
--amber: #ff8800           Primary brand color, call-to-action buttons
--orange-glow: #ff6600     HEX: #ff6600  Hover states, secondary emphasis
--gold: #ffaa00            HEX: #ffaa00  Highlights, rewards, success states
```

### Background Colors
```
Deep Black Backgrounds
--background: #0a0a0a      HEX: #0a0a0a  Main background
--card: #151515            HEX: #151515  Card surfaces
--popover: #1a1a1a         HEX: #1a1a1a  Elevated surfaces, popovers
--secondary: #1f1f1f       HEX: #1f1f1f  Secondary surfaces
--muted: #252525           HEX: #252525  Muted backgrounds
```

### Text Colors
```
--foreground: #e8e8e8      HEX: #e8e8e8  Primary text
--muted-foreground: #888   HEX: #888888  Secondary text, labels
```

### Accent Colors
```
Purple Energy (Premium/Battle Pass)
--purple-energy: #aa44ff   HEX: #aa44ff  Premium features, battle pass
--red-aura: #ff4444        HEX: #ff4444  Destructive actions, alerts
--green-success: #22c55e   Used for success states, completed items
```

### Border & Glow Effects
```
--border: rgba(255, 136, 0, 0.15)  Subtle orange-tinted borders
--ring: #ff8800                     Focus rings, glowing accents
```

---

## 📐 Spacing System

```
--spacing-1: 0.25rem    4px    Micro spacing
--spacing-2: 0.5rem     8px    Tight spacing
--spacing-3: 0.75rem    12px   Small spacing
--spacing-4: 1rem       16px   Base spacing
--spacing-6: 1.5rem     24px   Medium spacing
--spacing-8: 2rem       32px   Large spacing
--spacing-12: 3rem      48px   XL spacing
--spacing-16: 4rem      64px   XXL spacing
```

---

## 🔤 Typography System

### Font Stack
```
font-family: system-ui, -apple-system, sans-serif
Base font-size: 16px (1rem)
```

### Font Weights
```
--font-weight-normal: 400   Body text
--font-weight-medium: 600   Headings, buttons, emphasis
```

### Type Scale
```
h1: 3.75rem (60px)  font-weight: 600  line-height: 1.5
h2: 2.25rem (36px)  font-weight: 600  line-height: 1.5
h3: 1.5rem (24px)   font-weight: 600  line-height: 1.5
h4: 1.125rem (18px) font-weight: 600  line-height: 1.5
body: 1rem (16px)   font-weight: 400  line-height: 1.5
small: 0.875rem (14px)
```

---

## 🎯 Component Patterns

### Buttons

#### Primary Button (CTA)
```tsx
className="px-8 py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] 
  rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] 
  transition-all"
```
- Orange gradient background
- Glowing shadow on hover
- Bold text
- Rounded corners (0.75rem)

#### Secondary Button
```tsx
className="px-6 py-3 bg-[#1f1f1f] border border-[#ff8800]/30 
  rounded-xl hover:bg-[#252525] hover:border-[#ff8800]/60 
  transition-all"
```
- Dark background with orange border
- Hover state intensifies border
- Same rounded corners

#### Ghost Button
```tsx
className="px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 
  rounded-lg hover:bg-[#1f1f1f] transition-all"
```
- Minimal styling
- Subtle border
- Lighter hover state

### Cards

#### Standard Card
```tsx
className="p-6 bg-[#151515] border border-[#ff8800]/20 
  rounded-xl hover:border-[#ff8800]/40 transition-all"
```
- Dark stone background (#151515)
- Orange-tinted border
- Rounded corners
- Hover increases border opacity

#### Premium Card (Battle Pass, Shop Features)
```tsx
className="p-6 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] 
  border-2 border-purple-500/50 rounded-xl"
```
- Gradient background
- Purple border for premium content
- Thicker border (2px)

#### Elevated Card with Glow
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
- Glowing background effect
- Layered composition
- Enhanced visual hierarchy

### Inputs

#### Text Input
```tsx
className="w-full px-4 py-3 bg-[#1a1a1a] border 
  border-[#ff8800]/30 rounded-xl focus:outline-none 
  focus:border-[#ff8800] focus:ring-2 
  focus:ring-[#ff8800]/20 transition-all"
```
- Dark background
- Orange border
- Glow ring on focus
- Smooth transitions

### Progress Bars

#### Standard Progress
```tsx
<div className="h-2 bg-[#252525] rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-[#ff8800] 
    to-[#ff6600]" style={{ width: '60%' }} />
</div>
```
- Dark background track
- Orange gradient fill
- Rounded ends

#### Premium Progress (Battle Pass)
```tsx
<div className="h-2 bg-[#252525] rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-purple-500 
    to-[#ff8800]" style={{ width: '82%' }} />
</div>
```
- Purple to orange gradient
- Indicates premium content

### Badges & Labels

#### Live Badge
```tsx
className="px-3 py-1 bg-red-500 text-xs font-bold 
  rounded-full animate-pulse"
```

#### Info Badge
```tsx
className="px-2 py-1 bg-[#1a1a1a] border 
  border-[#ff8800]/30 rounded text-xs"
```

---

## 🌟 Visual Effects

### Glow Effects

#### Button Glow
```css
hover:shadow-[0_0_30px_rgba(255,136,0,0.4)]
```

#### Card Background Glow
```tsx
<div className="absolute inset-0 bg-gradient-to-b 
  from-[#ff8800]/20 to-transparent rounded-xl blur-2xl" />
```

#### Pulsing Glow (AI Trainer Eyes)
```tsx
animate={{
  boxShadow: [
    '0 0 20px rgba(255,136,0,0.5)',
    '0 0 40px rgba(255,136,0,0.8)',
    '0 0 20px rgba(255,136,0,0.5)',
  ],
}}
transition={{ duration: 2, repeat: Infinity }}
```

### Gradients

#### Text Gradient (Headings)
```tsx
className="bg-gradient-to-r from-[#ffaa00] via-[#ff8800] 
  to-[#ff6600] bg-clip-text text-transparent"
```

#### Background Gradient
```tsx
className="bg-gradient-to-b from-[#0a0a0a] 
  via-[#0f0f0f] to-[#1a1a1a]"
```

#### Radial Glow Background
```tsx
className="bg-[radial-gradient(ellipse_at_center,
  rgba(255,136,0,0.05)_0%,transparent_60%)]"
```

### Atmospheric Particles
```tsx
{[...Array(30)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-1 h-1 bg-[#ff8800] 
      rounded-full blur-sm"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      opacity: [0.1, 0.4, 0.1],
      scale: [1, 1.5, 1],
    }}
    transition={{
      duration: 4 + Math.random() * 3,
      repeat: Infinity,
      delay: Math.random() * 2,
    }}
  />
))}
```

---

## 🎮 Interactive States

### Hover Animations
```tsx
whileHover={{ scale: 1.02, y: -2 }}
```

### Tap Animations
```tsx
whileTap={{ scale: 0.98 }}
```

### Entrance Animations
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.2 }}
```

---

## 🏆 Icon System

### Using Lucide Icons
```tsx
import { Trophy, Star, Flame, Crown } from 'lucide-react';

<Trophy className="w-6 h-6 text-[#ff8800]" />
```

### Icon Sizes
- Small: w-4 h-4 (16px)
- Medium: w-5 h-5 (20px)
- Standard: w-6 h-6 (24px)
- Large: w-8 h-8 (32px)

### Icon Colors
- Primary: text-[#ff8800]
- Purple/Premium: text-purple-400
- Success: text-green-500
- Muted: text-[#888888]

---

## 🎨 Mahjong Tile Design

### Standard Tile
```tsx
className="aspect-[3/4] rounded-lg bg-gradient-to-br 
  from-[#2a2a2a] to-[#1f1f1f] border border-[#ff8800]/20 
  hover:border-[#ff8800]/60 transition-all"
```

### Selected Tile
```tsx
className="bg-gradient-to-br from-[#ff8800] to-[#ff6600] 
  shadow-[0_0_20px_rgba(255,136,0,0.5)] 
  border-2 border-[#ffaa00]"
```

### Tile Symbols
- Use emoji: 🀀 🀁 🀂 🀃 🀄 🀅 🀆
- Font-size: text-2xl to text-4xl depending on context
- Center aligned

---

## 📱 Responsive Breakpoints

```
sm: 640px    Mobile landscape
md: 768px    Tablet
lg: 1024px   Desktop
xl: 1280px   Large desktop
```

### Grid Patterns
```tsx
// Mobile-first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## 🎯 Layout Patterns

### Centered Content Container
```tsx
className="max-w-7xl mx-auto px-4 py-8"
```

### Sticky Header
```tsx
className="border-b border-[#ff8800]/20 bg-[#0f0f0f]/80 
  backdrop-blur-xl sticky top-0 z-50"
```

### Two-Column Layout
```tsx
className="grid lg:grid-cols-[1fr,300px] gap-6"
```

---

## 🌓 Dark Mode Only

This design system is built exclusively for dark mode:
- Deep black backgrounds (#0a0a0a, #151515)
- High contrast text (#e8e8e8)
- Glowing orange accents
- No light mode variant

---

## 🎬 Animation Guidelines

### Duration
- Quick interactions: 0.15s - 0.3s
- Standard transitions: 0.3s - 0.5s
- Entrance animations: 0.5s - 0.8s
- Atmospheric effects: 2s - 4s (infinite)

### Easing
- Default: ease-in-out
- Entrance: ease-out
- Exit: ease-in
- Spring effects for playful interactions

---

## 🎨 Brand Voice

### Visual Language
- **Cinematic**: Epic, movie-like quality
- **Mysterious**: Shadow aesthetic, glowing elements
- **Premium**: High-quality, polished, AAA-game feel
- **Martial Arts**: Eastern philosophy, discipline, mastery
- **Minimal**: No clutter, purposeful design

### Don'ts
- ❌ No bright neon colors
- ❌ No cartoonish elements
- ❌ No casino aesthetics
- ❌ No traditional Chinese restaurant style
- ❌ No flat, lifeless UI

### Do's
- ✅ Cinematic lighting and shadows
- ✅ Glowing orange/amber accents
- ✅ Stone-like dark surfaces
- ✅ Atmospheric particles
- ✅ Elegant animations
- ✅ Premium feel

---

## 📦 Component Library Summary

### Created Components
1. **LandingPage** - Hero with cinematic intro
2. **LoginScreen** - Modern auth with Google sign-in
3. **OnboardingScreen** - 3-step personalization flow
4. **TutorialScreen** - Interactive game tutorial
5. **Dashboard** - Central hub with all features
6. **GameScreen** - Main Mahjong gameplay
7. **VictoryScreen** - Dramatic win celebration
8. **TournamentScreen** - Live leaderboards
9. **StatisticsScreen** - Performance tracking with charts
10. **ShopScreen** - Premium content marketplace
11. **BattlePassScreen** - Seasonal progression rewards

### Reusable Patterns
- Feature cards
- Action buttons
- Stat boxes
- Quest items
- Leaderboard rows
- Reward cards
- Achievement badges
- Dialogue bubbles
- Currency displays

---

## 🎯 Accessibility Notes

### Contrast Ratios
- Primary text (#e8e8e8 on #0a0a0a): ~12:1 ✅
- Secondary text (#888888 on #151515): ~4.8:1 ✅
- Orange on dark (#ff8800 on #0a0a0a): ~8.5:1 ✅

### Focus States
- All interactive elements have visible focus rings
- Orange glow ring: `focus:ring-2 focus:ring-[#ff8800]/20`
- Border highlight on focus: `focus:border-[#ff8800]`

### Motion
- Animations are decorative, not functional
- Core functionality works without animations
- Respect `prefers-reduced-motion` for production

---

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44x44px (iOS guideline)
- Buttons: py-3 or py-4 (48px-64px height)
- Adequate spacing between interactive elements

### Mobile-Specific Patterns
- Full-width buttons on mobile
- Larger touch areas
- Simplified layouts on small screens
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 🔥 Performance Tips

### Optimization
- Use `motion/react` for animations (optimized)
- Limit particle count on mobile
- Use `backdrop-blur` sparingly
- Lazy load heavy components
- Optimize gradient usage

---

## ✨ Special Effects Showcase

### Premium Features Glow
```tsx
<div className="absolute inset-0 bg-gradient-to-r 
  from-purple-500/20 via-[#ff8800]/20 to-purple-500/20 
  blur-2xl" />
```

### Victory Screen Particles
```tsx
animate={{
  opacity: [0, 1, 0],
  scale: [0, 1.5, 0],
  y: [0, -50],
}}
```

### Combo Meter Pulse
```tsx
animate={{ width: ['60%', '80%', '60%'] }}
transition={{ duration: 2, repeat: Infinity }}
```

---

## 🎮 Game-Specific UI

### AI Trainer Status Indicator
```tsx
<div className="absolute -bottom-1 -right-1 w-5 h-5 
  bg-green-500 border-2 border-[#151515] 
  rounded-full" />
```

### Match History Item
```tsx
<div className="flex items-center justify-between 
  text-sm p-2 bg-[#1a1a1a] rounded">
  <span>{match.tiles}</span>
  <span className="text-[#ff8800]">{match.points}</span>
</div>
```

### Currency Display
```tsx
<div className="flex items-center gap-2 px-4 py-2 
  bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-gradient-to-br 
    from-[#ffaa00] to-[#ff6600]" />
  <span className="font-bold">2,450</span>
</div>
```

---

**Design System Version**: 1.0.0  
**Last Updated**: May 12, 2026  
**Platform**: Figma Make - Zen Mahjong  
**Inspiration**: Shadow Fight 2 × Premium Mobile Gaming × Eastern Martial Arts
