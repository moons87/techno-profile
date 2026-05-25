# Unique Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add polished, smooth animations across all three app screens using MCP Magic components and enhanced Framer Motion.

**Architecture:** Four new components generated via MCP Magic (`SwipeOverlay`, `ParticlesBurst`, `RippleEffect`, `ShimmerButton`) integrated into existing JSX. Framer Motion transitions enhanced with spring physics, stagger variants, and `useMotionValue` for drag tracking. Game logic in `App.jsx` is untouched.

**Tech Stack:** React 19, Framer Motion 12, Vite 6, MCP Magic (`mcp__magic__21st_magic_component_builder`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/SwipeOverlay.jsx` | Create | Like/Skip tint + stamp overlay driven by `dragX` motion value |
| `src/components/ParticlesBurst.jsx` | Create | Physics-based confetti replacing CSS `Confetti` component |
| `src/components/RippleEffect.jsx` | Create | Radial ripple wave triggered on combo activation |
| `src/components/ShimmerButton.jsx` | Create | Animated shimmer sweep on primary CTA button |
| `src/App.jsx` | Modify | Import new components, AnimatePresence per card, spring transitions, results cascade |
| `src/styles.css` | Modify | Add `@keyframes orb-pulse`, `cascade-in`; animate `.spotlight-orb` |

---

### Task 1: Generate SwipeOverlay via MCP Magic

**Files:**
- Create: `src/components/SwipeOverlay.jsx`

- [ ] **Step 1: Call MCP Magic**

Call `mcp__magic__21st_magic_component_builder` with:

```
prompt: "Create a React component called SwipeOverlay for a Tinder-style swipe card. Props: { dragX } — a Framer Motion motion value. Using useTransform from framer-motion: derive likeOpacity = useTransform(dragX, [30, 120], [0, 1], { clamp: true }), skipOpacity = useTransform(dragX, [-120, -30], [1, 0], { clamp: true }). Render an absolutely-positioned overlay (position:absolute, inset:0, borderRadius:28px, pointerEvents:'none', overflow:'hidden', zIndex:2). Inside: (1) a motion.div with background 'rgba(110,255,140,0.28)' position absolute inset 0, opacity=likeOpacity; (2) a motion.div with background 'rgba(255,90,90,0.28)' position absolute inset 0, opacity=skipOpacity; (3) a motion.div stamp for LIKE: position absolute, top:24px, left:24px, rotate:-20deg, border '3px solid #6eff8c', borderRadius:8px, padding:'4px 14px', color:'#6eff8c', fontSize:'2.2rem', fontWeight:900, opacity=likeOpacity; (4) a motion.div stamp for SKIP: position absolute, top:24px, right:24px, rotate:20deg, border '3px solid #ff6b6b', borderRadius:8px, padding:'4px 14px', color:'#ff6b6b', fontSize:'2.2rem', fontWeight:900, opacity=skipOpacity. Export default SwipeOverlay."
message: "SwipeOverlay component"
```

- [ ] **Step 2: Save output**

Save the generated code to `src/components/SwipeOverlay.jsx`. Confirm:
- `import { useTransform } from "framer-motion"` is present
- Props signature is `function SwipeOverlay({ dragX })`
- Default export is `SwipeOverlay`

---

### Task 2: Generate ParticlesBurst via MCP Magic

**Files:**
- Create: `src/components/ParticlesBurst.jsx`

- [ ] **Step 1: Call MCP Magic**

Call `mcp__magic__21st_magic_component_builder` with:

```
prompt: "Create a React component called ParticlesBurst. Props: { burst } (number, increments to re-trigger). Uses useState to track an active key that updates when burst changes (useEffect watching burst sets key to Date.now()). Renders a container div (position:absolute, inset:0, overflow:'hidden', pointerEvents:'none', zIndex:20). When active (key !== null), renders 24 motion.div particles inside AnimatePresence. Each particle: position absolute, top:-20px, left = (index * 13 % 100) + '%', width: 8+(index%3)*4+'px', height: 16+(index%4)*5+'px', borderRadius:4px, background from array ['#6fe4ff','#91ffa7','#ffc978','#ff7c93','#c4b6ff','#b9f8ff'] indexed by (index%6). Each particle animates: initial={{ y:-20, opacity:0, rotate:0, x:0 }}, animate={{ y:380, opacity:[0,1,1,0], rotate:(index%2===0?1:-1)*(180+index*22), x:(index%2===0?1:-1)*(20+index%40) }}, transition={{ duration: 1.6+(index%4)*0.18, delay: (index%6)*0.06, ease:'easeIn' }}. Use a key on each particle combining the active key + index so they remount per burst. Export default ParticlesBurst."
message: "ParticlesBurst component"
```

- [ ] **Step 2: Save output**

Save to `src/components/ParticlesBurst.jsx`. Confirm default export is `ParticlesBurst` and it accepts `{ burst }`.

---

### Task 3: Generate RippleEffect via MCP Magic

**Files:**
- Create: `src/components/RippleEffect.jsx`

- [ ] **Step 1: Call MCP Magic**

Call `mcp__magic__21st_magic_component_builder` with:

```
prompt: "Create a React component called RippleEffect. Props: { active (boolean), children }. Uses useRef(0) for a counter; useEffect watching active fires counter++ when active becomes true. Renders a wrapper div (position:'relative', display:'inline-block', width:'100%') containing children AND a ripple layer. The ripple layer uses AnimatePresence: when counter > 0 render a motion.div with key=counter, position:absolute, top:'50%', left:'50%', width:20, height:20, borderRadius:'50%', background:'rgba(111,228,255,0.5)', marginTop:-10, marginLeft:-10, pointerEvents:'none', zIndex:10, initial={{ scale:0, opacity:0.9 }}, animate={{ scale:20, opacity:0 }}, exit={{ opacity:0 }}, transition={{ duration:0.65, ease:'easeOut' }}. Export default RippleEffect."
message: "RippleEffect component"
```

- [ ] **Step 2: Save output**

Save to `src/components/RippleEffect.jsx`. Confirm it accepts `{ active, children }` and renders `children`.

---

### Task 4: Generate ShimmerButton via MCP Magic

**Files:**
- Create: `src/components/ShimmerButton.jsx`

- [ ] **Step 1: Call MCP Magic**

Call `mcp__magic__21st_magic_component_builder` with:

```
prompt: "Create a React component called ShimmerButton. Props spread onto a <button>: { children, ...props }. Renders a button element with ...props spread, style={{ position:'relative', overflow:'hidden' }}. Inside: (1) a span with style={{ position:'relative', zIndex:1 }} wrapping children; (2) a motion.div shimmer overlay with style={{ position:'absolute', inset:0, background:'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)', backgroundSize:'200% 100%' }}, animate={{ backgroundPosition:['200% 0', '-200% 0'] }}, transition={{ duration:2.2, ease:'linear', repeat:Infinity, repeatDelay:1.4 }}. Export default ShimmerButton."
message: "ShimmerButton component"
```

- [ ] **Step 2: Save output**

Save to `src/components/ShimmerButton.jsx`. Confirm it spreads props onto `<button>` and renders `children` inside a `z-index:1` span.

- [ ] **Step 3: Commit all four MCP Magic components**

```bash
git add src/components/
git commit -m "feat: add SwipeOverlay, ParticlesBurst, RippleEffect, ShimmerButton via MCP Magic"
```

---

### Task 5: Add CSS keyframes to styles.css

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add `animation` to existing `.spotlight-orb` rule**

Find the existing `.spotlight-orb` rule (around line 997) and add one property:

```css
.spotlight-orb {
  position: absolute;
  top: -10px;
  right: -22px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(111, 228, 255, 0.28), transparent 65%);
  filter: blur(12px);
  pointer-events: none;
  animation: orb-pulse 3s ease-in-out infinite; /* add this line */
}
```

- [ ] **Step 2: Append keyframes at end of styles.css**

Add before the first `@media` query:

```css
@keyframes orb-pulse {
  0%, 100% { transform: scale(1); opacity: 0.28; }
  50% { transform: scale(1.18); opacity: 0.44; }
}

@keyframes cascade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add orb-pulse and cascade-in CSS keyframes"
```

---

### Task 6: Enhance welcome screen + fix play-stack key

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add `useMotionValue` to framer-motion import**

Find:
```jsx
import { AnimatePresence, motion } from "framer-motion";
```
Replace with:
```jsx
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
```

- [ ] **Step 2: Add `useRef` to React import**

Find:
```jsx
import { useEffect, useMemo, useState } from "react";
```
Replace with:
```jsx
import { useEffect, useMemo, useRef, useState } from "react";
```

- [ ] **Step 3: Fix play-stack key so it no longer remounts per card**

Find:
```jsx
{stage === "play" && currentCard && (
  <motion.div
    key={`play-${currentCard.id}`}
    className="play-stack"
```
Replace with:
```jsx
{stage === "play" && currentCard && (
  <motion.div
    key="play"
    className="play-stack"
```

- [ ] **Step 4: Polish welcome-stack exit**

Find the `key="welcome"` motion.div exit:
```jsx
exit={{ opacity: 0, y: -16 }}
```
Replace with:
```jsx
exit={{ opacity: 0, scale: 0.97, y: -20 }}
```

- [ ] **Step 5: Update HeroCharacter float for organic feel**

In the `HeroCharacter` function, find:
```jsx
animate={{ y: [0, -8, 0] }}
transition={{ duration: 4 + delay * 3, repeat: Infinity, ease: "easeInOut" }}
```
Replace with:
```jsx
animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
transition={{ duration: 4 + delay * 3, repeat: Infinity, ease: "easeInOut" }}
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: polish welcome exit transition and hero float animation"
```

---

### Task 7: Integrate SwipeOverlay + spring card enter/exit

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import SwipeOverlay**

Add after the existing framer-motion import line:
```jsx
import SwipeOverlay from "./components/SwipeOverlay";
```

- [ ] **Step 2: Wrap card-stage in AnimatePresence**

Find:
```jsx
<div className="card-stage">
  <SwipeCard
    card={currentCard}
    locale={locale}
    comboReady={currentComboReady}
    onAnswer={applyOutcome}
  />
</div>
```
Replace with:
```jsx
<div className="card-stage">
  <AnimatePresence mode="wait">
    <SwipeCard
      key={currentCard.id}
      card={currentCard}
      locale={locale}
      comboReady={currentComboReady}
      onAnswer={applyOutcome}
    />
  </AnimatePresence>
</div>
```

- [ ] **Step 3: Replace SwipeCard function**

Find and replace the entire `SwipeCard` function with:

```jsx
function SwipeCard({ card, locale, comboReady, onAnswer }) {
  const dragX = useMotionValue(0);
  const exitDirRef = useRef(1);

  return (
    <motion.article
      className={`swipe-card ${accentClasses[card.accent]}`}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      style={{ x: dragX }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) {
          exitDirRef.current = 1;
          onAnswer("like");
        } else if (info.offset.x < -120) {
          exitDirRef.current = -1;
          onAnswer("skip");
        }
      }}
      initial={{ scale: 0.88, y: 18, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{
        x: exitDirRef.current === 1 ? 600 : -600,
        rotate: exitDirRef.current === 1 ? 30 : -30,
        opacity: 0,
        filter: "blur(4px)",
      }}
      transition={{
        x: { type: "spring", stiffness: 320, damping: 26 },
        rotate: { type: "spring", stiffness: 320, damping: 26 },
        opacity: { duration: 0.22 },
        filter: { duration: 0.22 },
      }}
      whileDrag={{ rotate: 8, scale: 1.02 }}
    >
      <SwipeOverlay dragX={dragX} />
      <div className="card-glow" />
      <div className="card-topline">
        <span>Superpower Signal</span>
        <span>0{card.id}</span>
      </div>

      {card.combo ? (
        <div className={`card-combo-pill ${comboReady ? "ready" : ""}`}>
          <span>{localeText[locale].comboActivated}</span>
          <strong>{card.combo.title[locale]}</strong>
        </div>
      ) : null}

      <h3>{card.title[locale]}</h3>
      <p>{card.body[locale]}</p>

      <div className="card-footer">
        <span>← {localeText[locale].swipeLeft}</span>
        <span>{localeText[locale].swipeRight} →</span>
      </div>
    </motion.article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: spring card enter/exit with directional fly-off and SwipeOverlay"
```

---

### Task 8: Integrate RippleEffect on combo banner

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import RippleEffect**

Add import:
```jsx
import RippleEffect from "./components/RippleEffect";
```

- [ ] **Step 2: Wrap combo-banner with RippleEffect**

Find:
```jsx
<AnimatePresence>
  {comboMoment && (
    <motion.div
      className="combo-banner"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <span>{text.comboActivated}</span>
      <strong>{comboMoment.title[locale]}</strong>
    </motion.div>
  )}
</AnimatePresence>
```
Replace with:
```jsx
<AnimatePresence>
  {comboMoment && (
    <RippleEffect active={!!comboMoment}>
      <motion.div
        className="combo-banner"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
      >
        <span>{text.comboActivated}</span>
        <strong>{comboMoment.title[locale]}</strong>
      </motion.div>
    </RippleEffect>
  )}
</AnimatePresence>
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: ripple wave on combo activation"
```

---

### Task 9: Integrate ShimmerButton on welcome CTA

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import ShimmerButton**

Add import:
```jsx
import ShimmerButton from "./components/ShimmerButton";
```

- [ ] **Step 2: Replace the welcome CTA button**

Find:
```jsx
<div className="welcome-actions">
  <button type="button" className="primary-button" onClick={beginGame}>
    {text.start}
  </button>
</div>
```
Replace with:
```jsx
<div className="welcome-actions">
  <ShimmerButton type="button" className="primary-button" onClick={beginGame}>
    {text.start}
  </ShimmerButton>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: shimmer sweep on welcome start button"
```

---

### Task 10: Enhance results screen animations

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import ParticlesBurst and replace Confetti**

Add import:
```jsx
import ParticlesBurst from "./components/ParticlesBurst";
```

Find:
```jsx
<Confetti burst={burst} />
```
Replace with:
```jsx
<ParticlesBurst burst={burst} />
```

- [ ] **Step 2: Animate hero character card reveal**

Find:
```jsx
<div className={`result-hero-card ${resultHero.accent}`}>
```
Replace with:
```jsx
<motion.div
  className={`result-hero-card ${resultHero.accent}`}
  initial={{ scale: 0.82, filter: "blur(8px)", opacity: 0 }}
  animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
  transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.15 }}
>
```
And its closing `</div>` with `</motion.div>`.

- [ ] **Step 3: Stagger power bar cards**

Find:
```jsx
{rankedPowers.slice(0, 3).map((power) => (
  <article key={power.key} className="power-card">
```
Replace with:
```jsx
{rankedPowers.slice(0, 3).map((power, powerIndex) => (
  <motion.article
    key={power.key}
    className="power-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + powerIndex * 0.15, duration: 0.5, ease: "easeOut" }}
  >
```
And its closing `</article>` with `</motion.article>`.

- [ ] **Step 4: Cascade specialty cards**

Find:
```jsx
{recommendations.map((specialty, specialtyIndex) => (
  <article key={specialty.id} className="specialty-card">
```
Replace with:
```jsx
{recommendations.map((specialty, specialtyIndex) => (
  <motion.article
    key={specialty.id}
    className="specialty-card"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + specialtyIndex * 0.1, duration: 0.45, ease: "easeOut" }}
  >
```
And its closing `</article>` with `</motion.article>`.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: results screen — hero blur reveal, power bar stagger, specialty cascade, particle burst"
```

---

### Task 11: Visual QA

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```
Open `http://localhost:4173`

- [ ] **Step 2: Welcome screen checks**
  - HeroCharacter cards appear with visible stagger (not all at once)
  - Float animation has subtle rotation
  - "Начать" button shows shimmer sweep every ~4s
  - Clicking "Начать" — panel scales down + fades out smoothly

- [ ] **Step 3: Swipe screen checks**
  - Drag card right → green tint + "LIKE" stamp fades in proportionally
  - Drag card left → red tint + "SKIP" stamp fades in proportionally
  - Release >120px right → card flies off to the right with blur+rotate
  - Release >120px left → card flies off to the left with blur+rotate
  - Next card springs in with bounce (not instant)
  - Trigger combo → ripple wave expands from combo banner

- [ ] **Step 4: Results screen checks**
  - Hero character card blurs in from small scale (not instant snap)
  - Power bars fill one after another (not all simultaneously)
  - Specialty cards slide up from below in sequence
  - Particles burst on screen arrival
  - Spotlight orb pulses subtly

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: visual QA complete — animation overhaul across all screens"
```
