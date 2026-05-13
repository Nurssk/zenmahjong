# Zen Mahjong Figma Design Audit

Source: `Zen Mahjong High-Fidelity Mockup/`

## Detected Pages / Screens

- Landing Page: cinematic hero, particle field, glowing `ZEN MAHJONG` title, large `PLAY NOW` CTA, three feature cards, auth actions.
- Login / Register: single glassmorphism auth card with Google sign-in, email/password fields, divider, glowing focus states, back navigation.
- Onboarding: 3-step setup flow for level, AI trainer, and arena/board skin selection.
- Tutorial: 4-step guided tutorial with visual board, matching, tool, and trainer demonstrations.
- Dashboard: sticky header, currency display, large play CTA, continue game, daily tournament, daily quests, battle pass, stats, and shop cards.
- Game Screen: cinematic static gameplay demo with 8-column tile board, timer, score, pause, progress, action buttons, AI trainer panel, match history, combo meter.
- Victory Screen: celebratory panel with trophy glow, performance stats, rewards, quest completions, play/dashboard actions.
- Tournament Screen: live tournament header, countdown, prize pool, prize cards, global and Kazakhstan ranking lists, join CTA.
- Statistics Screen: key stat cards, weekly performance line chart, win-rate bar chart, playtime, records, rankings, achievements.
- Shop Screen: currency header, featured premium trainer bundle, trainers, board skins, currency packs, rarity borders.
- Battle Pass Screen: Season 1 Shadow Warriors, XP progress, premium upsell, free/premium reward track, featured level-10 trainer.

## Visual Style Summary

- Shadow Fight 2 inspired dark oriental premium game UI.
- Deep black and stone surfaces with orange/amber glow as the primary energy.
- Purple premium treatment for Battle Pass, gems, legendary bundles, and premium rewards.
- Strong radial glow backgrounds, small animated particles, and hover/tap motion.
- Cards are dark, rounded, orange-bordered, and glow subtly on hover.
- Primary CTAs are large orange-to-red-orange gradients with outer blur/glow.
- The design should feel like a premium mobile/desktop game hub, not a web dashboard template.

## Color Tokens

- Background: `#0a0a0a`
- Background mid: `#0f0f0f`
- Card: `#151515`
- Elevated surface: `#1a1a1a`
- Secondary surface: `#1f1f1f`
- Muted surface: `#252525`
- Primary text: `#e8e8e8`
- Muted text: `#888888`
- Primary amber: `#ff8800`
- Orange glow: `#ff6600`
- Gold highlight: `#ffaa00`
- Purple energy: `#aa44ff`
- Red aura/live/destructive: `#ff4444`
- Border: `rgba(255, 136, 0, 0.15)`
- Focus ring: `#ff8800`

## Typography

- Font stack: `system-ui, -apple-system, sans-serif`.
- Base font size: `16px`.
- Headings use weight `600` to `700`, often with gold/orange gradient text.
- Body uses weight `400`, color `#e8e8e8`.
- Secondary labels use `#888888`, smaller sizes, and compact line height.
- Buttons use bold/medium text and should retain readable sizing on mobile.

## Component System

- Buttons:
  - Primary: orange gradient, rounded-xl, bold, glow hover.
  - Secondary/outline: dark surface, orange border, hover border intensifies.
  - Premium: purple gradient/glow for Battle Pass and shop upsells.
- Cards:
  - Standard: `#151515`, `border-[#ff8800]/20`, rounded-xl.
  - Elevated: layered orange blur behind dark card.
  - Premium: purple gradient/border for premium content.
- Inputs:
  - `#1a1a1a` fill, orange-tinted border, orange focus ring.
- Progress:
  - Standard: muted track with orange gradient fill.
  - Premium: purple-to-orange or purple gradient fill.
- Navigation:
  - Sticky desktop/header treatment with `#0f0f0f` and backdrop blur.
  - Mobile requires bottom navigation, touch-friendly controls, and stacked cards.
- Game:
  - Static board with dark stone tiles, selected orange glow, progress bar, trainer panel, combo meter.

## Implementation Notes

- Preserve existing Next.js routes and Firebase env-gated scaffolding.
- Map `TournamentScreen` to `/leaderboard`.
- Compose `/profile` from the same Figma card/stats/trainer visual language because no dedicated profile screen exists in the export.
- Port charts on `/stats` with `recharts`, matching the Figma line/bar chart styling.
- Keep `/game` static/demo-only; use state only for visual selection/pause affordances.
- Prefer shared tokens and reusable components over repeated arbitrary hex values in page code.
- Keep product name as `Zen Mahjong` everywhere.

## Missing Assets / Assumptions

- No separate raster image assets were detected; the export relies on gradients, particles, emoji Mahjong symbols, and Lucide icons.
- Light mode is not fully designed in the export; implement a clean light token variant only as a fallback, preserving orange/purple identity.
- Victory is present in the export but not in the approved route list; implement its visual language as reusable components rather than adding a new route.
