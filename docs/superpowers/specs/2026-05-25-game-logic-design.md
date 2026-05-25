# Game Logic Improvements — Design Spec

**Date:** 2026-05-25  
**Project:** superpower-map (Tinder-style career quiz)  
**Approach:** A — Targeted edits, no new files

---

## Overview

Three focused improvements to differentiate player results, add replay variety, and make archetype matching more accurate. All changes stay in `src/data.js` and `src/App.jsx`. No new files, no new dependencies.

---

## Change 1 — Skip Rebalancing (A3)

### Problem
Current `skip` outcomes award 1+1 points to minor powers. This is too weak — players who skip most cards still accumulate similar power profiles to players who like them, because `like` gives 2+2+1 = 5 points while `skip` gives 1+1 = 2 points across opposing powers. Results end up similar for most players.

### Solution
Increase every card's `skip` primary value from 1 to 2. The secondary skip value stays at 1. New pattern: `skip: { opposingPower: 2, secondaryPower: 1 }`.

This doubles the skip signal: a player who skips a logic/practice card now gets +2 create (not +1). After 12 cards, a consistent skip-pattern gives ~10 points to creative/connect powers vs. a like-pattern giving ~10 to logic/practice — clearly different profiles.

### Rules for skip values
- Skip powers must not overlap with like powers on the same card
- Primary skip power (value: 2) should be the most "opposite" to the card's theme
- Secondary skip power (value: 1) from the remaining opposing pool

### Cards to update (all 12 in `data.js`)
Every card's `skip` entry: bump the highest skip value from 1 → 2. Keep the second skip value at 1.

Example:
```js
// Card 1 — internet outage (like: logic, practice)
// Before: skip: { create: 1, connect: 1 }
// After:  skip: { create: 2, connect: 1 }
```

---

## Change 2 — Card Shuffle (B)

### Problem
Cards always appear in the same fixed order. Replaying the game feels identical.

### Solution
Add `cardOrder` state to `App.jsx`. On `beginGame()`, shuffle all 12 cards with Fisher-Yates and store the result. `currentCard` reads from `cardOrder[index]` instead of `cards[index]`.

### Implementation

In `App.jsx`:
```js
const [cardOrder, setCardOrder] = useState(cards);
```

In `beginGame()`, add before `setIndex(0)`:
```js
setCardOrder([...cards].sort(() => Math.random() - 0.5));
```

Replace every reference to `cards[index]` and `currentCard = cards[index]` with `cardOrder[index]`.

The `cards.length` references (progress bar, index guard) remain unchanged — `cardOrder` always has the same length.

---

## Change 3 — Archetype Scoring (D3)

### Problem
Current matching: `profileArchetypes.find(a => a.match.every(p => topKeys.includes(p)))`. This only looks at the top-2 powers and picks the first archetype whose 2 match powers both appear in that top-2. If no exact match exists, it falls through to the generic archetype. This ignores the magnitude of scores — a player with logic:8 and practice:1 gets the same archetype as logic:8 and practice:7.

### Solution

**Step 1 — Add `normalizedScores` useMemo** (depends on `scores`, placed before `archetype` and `recommendations` useMemos):
```js
const normalizedScores = useMemo(() => {
  const max = Math.max(...Object.values(scores), 1);
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v / max]));
}, [scores]);
```

**Step 2 — Replace `archetype` useMemo** (currently depends on `rankedPowers`, now depends on `normalizedScores`):
```js
const archetype = useMemo(() => {
  return profileArchetypes.reduce((best, current) => {
    const score = current.match.reduce((s, p) => s + (normalizedScores[p] ?? 0), 0);
    return score > best.score ? { archetype: current, score } : best;
  }, { archetype: profileArchetypes[profileArchetypes.length - 1], score: -1 }).archetype;
}, [normalizedScores]);
```

**Step 3 — Update `recommendations` useMemo** to use `normalizedScores` instead of raw `scores`:
```js
const specialtyScore = Object.entries(specialty.powers).reduce(
  (sum, [power, weight]) => sum + weight * (normalizedScores[power] ?? 0),
  0
);
```
Change `[scores]` dependency to `[normalizedScores]`.

### Why this is better
- Player with logic:8, practice:1 now correctly matches logic-primary archetypes over logic+practice archetypes
- No more "falls through to generic" — every player gets the most appropriate archetype
- Specialty order more accurately reflects the player's strongest dimensions

---

## Files Changed

| File | Change |
|------|--------|
| `src/data.js` | Bump primary `skip` value from 1→2 on all 12 cards |
| `src/App.jsx` | Add `cardOrder` state + shuffle in `beginGame()` + normalized archetype scoring |

---

## Out of Scope
- Adding new cards
- Changing like values
- Changing archetype definitions or match arrays
- Changing specialty power weights
