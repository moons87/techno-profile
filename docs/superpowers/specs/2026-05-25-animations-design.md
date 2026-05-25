# Unique Animations — Design Spec

**Date:** 2026-05-25  
**Project:** superpower-map (Tinder-style career quiz)  
**Approach:** B — MCP Magic premium overlay components + Framer Motion enhancements

---

## Overview

Add polished, smooth animations across all three app screens using MCP Magic to generate new animated components and enhancing existing Framer Motion usage. Game logic in `App.jsx` is not changed — only rendering layer is enhanced.

**Style:** Smooth / Polished — spring physics, stagger effects, parallax, soft morphs. Dramatic bursts reserved for key moments (combo, results reveal).

---

## Architecture

Two layers of changes:

1. **New components (MCP Magic):** `SwipeOverlay`, `ParticlesBurst`, `RippleEffect` — built via `mcp__magic__21st_magic_component_builder`, integrated into existing JSX.
2. **Enhanced Framer Motion:** Updated `transition` props, stagger `variants`, spring configs, and new CSS keyframes in `styles.css`.

No new dependencies required — Framer Motion v12 already installed.

---

## Screen 1 — Welcome

### Current
- Single `opacity: 0→1, y: 24→0` fade on the whole `welcome-stack`
- `HeroCharacter` components animate simultaneously with individual float loops

### Changes
- **Stagger entrance:** `HeroCharacter` cards appear with `0.1s` delay between each using Framer Motion `variants` + `staggerChildren`
- **Parallax float:** Update existing `y: [0, -8, 0]` to `y: [0, -12, 0]` with a `spring`-style ease; add subtle `rotate: [0, 1.5, 0]` for organic feel
- **Shimmer button:** MCP Magic generates a `ShimmerButton` component wrapping the existing "Начать" primary button — animated gradient sweep on hover/idle
- **Stage transition:** `exit` on `welcome-stack` changes to `{ opacity: 0, scale: 0.97, y: -20 }` for a more polished handoff to the play screen

---

## Screen 2 — Play (Swipe)

### Current
- `whileDrag={{ rotate: 8, scale: 1.02 }}` — minimal feedback
- Card exits with `scale: 0.9, opacity: 0` — abrupt
- No visual like/skip indicator during drag

### Changes

#### SwipeOverlay component (MCP Magic)
Rendered inside `SwipeCard`, absolutely positioned over the card content:
- `SwipeCard` creates `dragX = useMotionValue(0)` and passes it to both `drag` and `SwipeOverlay`
- Shows green tint + `"LIKE"` stamp when `dragX > 30`, red tint + `"SKIP"` stamp when `dragX < -30`
- Opacity of stamp and tint derived via `useTransform(dragX, [-120, 0, 120], [1, 0, 1])`

#### Card exit animation
Wrap the `card-stage` div in `<AnimatePresence mode="wait">` with `key={currentCard.id}` so each card gets its own mount/unmount cycle. 

`SwipeCard` tracks drag internally via `useMotionValue(0)` + `motionValue.on("change")` to know exit direction. On unmount, exits with:
```
exit={{ x: exitDir > 0 ? 600 : -600, rotate: exitDir > 0 ? 30 : -30, opacity: 0, filter: "blur(4px)" }}
```
`exitDir` is a ref set on drag end before calling `onAnswer`.

#### Next card entrance
Add `initial={{ scale: 0.88, y: 18, opacity: 0 }}` + `transition={{ type: "spring", stiffness: 320, damping: 26 }}` for physical pop-in.

#### Combo ripple (RippleEffect — MCP Magic)
Wraps the `combo-banner` div. On `comboMoment` becoming truthy, fires a radial ripple wave expanding from card center.

---

## Screen 3 — Results

### Current
- Single fade-in of entire `result-stack`
- Power bars all animate to width simultaneously
- CSS confetti (18 `<span>` pieces, simple `translate + rotate` keyframe)
- Spotlight orb is static

### Changes

#### Hero character reveal
`result-hero-card` gets: `initial={{ scale: 0.82, filter: "blur(8px)", opacity: 0 }}` → `animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}` with `transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}`

#### Power bars stagger
Wrap `powers-grid` items in Framer Motion `variants` with `staggerChildren: 0.15`. Each bar's fill animates `width: 0 → final` with `transition={{ delay: staggerIndex * 0.15, duration: 0.6, ease: "easeOut" }}`.

#### Specialties cascade
`result-list` specialty cards each get `initial={{ opacity: 0, y: 24 }}` with `transition={{ delay: index * 0.1 + 0.4 }}`.

#### ParticlesBurst (MCP Magic)
Replaces current `Confetti` component. Physics-based particles: random velocity vectors, gravity, fade-out. Triggers on `burst` prop change (same as current `Confetti`).

#### Spotlight orb pulse
Add CSS `@keyframes orb-pulse` — scale `1 → 1.18 → 1` + opacity `0.28 → 0.44 → 0.28` on 3s loop. Applied to `.spotlight-orb`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.jsx` | Updated Framer Motion props, new component imports, `useMotionValue` for dragX |
| `src/styles.css` | New keyframes: `orb-pulse`, `shimmer-sweep`, `cascade-in` |
| `src/components/SwipeOverlay.jsx` | New — MCP Magic generated |
| `src/components/ParticlesBurst.jsx` | New — MCP Magic generated, replaces Confetti |
| `src/components/RippleEffect.jsx` | New — MCP Magic generated |
| `src/components/ShimmerButton.jsx` | New — MCP Magic generated |

---

## Out of Scope

- Changes to game logic (`applyOutcome`, scoring, combo detection)
- Mobile touch gesture changes
- Adding new libraries (no GSAP, no CSS-in-JS)
- Backend / data layer
