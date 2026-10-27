# Adding a game

Every game is one folder in `src/games/<id>/` plus one line in `src/games/registry.ts`.
The shared kit handles the intro card, the 3-2-1 countdown, results, stars, records, levels and streaks.

## Who it's for

Kids (roughly 5 to 11). Big buttons, emoji, bright colours, short words, friendly feedback.
Never punish harshly: a mistake costs a combo or a heart, with a soft sound, never a scary one.

## The fun checklist (every game must pass)

1. **Short rounds**: 45 to 90 seconds, or a few turns.
2. **Instant feedback**: every tap gets a sound (`sound.good(combo)`, `sound.bad()`, `sound.pop()`) and a visual (`addPop('+10', x, y)`, `shake()`).
3. **Combos or streaks**: doing well in a row is worth more and sounds better.
4. **Adaptive difficulty**: use the `level` prop (1 to 10). Level 1 must be easy for a 5-year-old.
5. **A score worth beating**: report a meaningful `score` and an honest `accuracy` (0 to 1).
6. **Learn in 5 seconds**: `howTo` is one or two short sentences a child can follow.
7. **Works on a phone**: touch first (`onPointerDown` for fast taps), fits a 390 px wide screen, no hover-only UI.

## Folder layout

```
src/games/<id>/
  index.ts      GameDef: meta + strings + Component
  Game.tsx      the round (default export)
  strings.ts    every piece of text, keyed, under `en`
  content.ts    word lists, stories, levels (optional, keyed by locale)
  logic.ts      pure rules and scoring (optional but preferred)
  logic.test.ts tests for logic.ts
```

Copy an existing game that is closest to your idea (e.g. `stroop-clash` for a tap-the-answer game,
`number-ninja` or `type-defender` for things that move, `sequence-echo` for turn-based).

## The contract

```ts
// index.ts
const game: GameDef = {
  meta: { id: 'my-game', skill: 'logic', icon: '🧩', color: '#ff9f43', added: '2026-10-27' },
  strings,
  Component: Game,
}
```

`Game` receives `GameProps`:

- `level`: 1..10, from the player's history. Scale speed, size, number range, etc.
- `seed`: use `makeRng(seed)` for every random choice (the daily challenge relies on it).
- `t(key, vars?)`: translates keys from `strings.ts`. Never hard-code visible text.
- `onFinish({ score, accuracy })`: call exactly once, then stop timers and ignore input.
  `accuracy >= 0.8` raises the level, `< 0.45` lowers it.

## Kit pieces (`src/kit`)

- `hooks.ts`: `useCountdown(seconds, onEnd, running)`, `useGameLoop(dt => …, running)`, `useTimeouts()`,
  `usePops()`, `useShake()`, `useInterval()`.
- `ui.tsx`: `<Hud items>`, `<TimerBar>`, `<Pops>`, `<Hearts>`, `<Confetti>`.
- `sound.ts`: `sound.good(combo)`, `bad`, `pop`, `tap`, `tick`, `win`, `tone(freq, dur)`, `vibrate(ms)`.
- `random.ts`: `makeRng(seed)` with `int`, `pick`, `shuffle`, `chance`; `clamp`.
- Shared CSS classes in `src/styles.css`: `.game`, `.prompt`, `.choices`, `.choice-btn`, `.big-btn`.
  Game-specific CSS goes at the end of `styles.css` under a `/* <Game title> */` comment, with a short class prefix.
  Use `var(--game-color)` for the game's accent.

## Translations

UI language is English for now, but everything goes through keys so other languages can be added:
add `xx.ts` next to `src/i18n/en.ts`, register it in `src/i18n/index.ts`, then add an `xx` block to each game's
`strings.ts` and `content.ts`. Missing keys fall back to English.

## Before opening a PR

```
npm test          # registry test mounts every game and taps every button
npm run build     # type-check + production build
```

Then play it in `npm run dev` on a phone-sized window. If it isn't fun, change it before shipping.
Finally, move the idea from "Up next" to "Shipped" in `GAME_IDEAS.md`.
