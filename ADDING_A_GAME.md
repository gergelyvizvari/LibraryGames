# Adding a game

Every game is one folder in `src/games/<id>/` plus one line in `src/games/registry.ts`.
The shared kit handles the intro card, the 3-2-1 countdown, results, stars, records, levels and streaks.

## Who it's for

Kids (roughly 5 to 11). Big buttons, drawn sticker icons and emoji, bright colours, short words, friendly feedback.
Never punish harshly: a mistake costs a combo or a heart, with a soft sound, never a scary one.

## The fun checklist (every game must pass)

1. **Short rounds**: 45 to 90 seconds, or a few turns.
2. **Instant feedback**: every tap gets a sound (`sound.good(combo)`, `sound.bad()`, `sound.pop()`) and a visual (`addPop('+10', x, y)`, `shake()`).
3. **Combos or streaks**: doing well in a row is worth more and sounds better.
4. **Adaptive difficulty**: use the `level` prop (1 to 10). Level 1 must be easy for a 5-year-old.
5. **A score worth beating**: report a meaningful `score` and an honest `accuracy` (0 to 1).
6. **Learn in 5 seconds**: `howTo` is one or two short sentences a child can follow.
7. **Works on a phone**: touch first (`onPointerDown` for fast taps), fits a 390 px wide screen, no hover-only UI.
8. **Plenty of content**: a kid should not see the same question twice in a few rounds. Word, story, country or
   picture lists need at least 20 items available at every level (50+ in total is a good start), and higher levels
   should swap in harder items, not only add them. Add a `content.test.ts` that checks the pool size per level and
   that there are no duplicates, for every language (`describe.each(Object.entries(words))`).
9. **Every language**: the game ships in English and Hungarian. See "Translations" below.

## Folder layout

```
src/games/<id>/
  index.ts      GameDef: meta + strings + Component
  icon.tsx      the game's drawn icon (see Icons below)
  Game.tsx      the round (default export)
  strings.ts    every piece of text, keyed, under `en` and `hu`
  content.ts    word lists, stories, levels (optional, keyed by locale)
  logic.ts      pure rules and scoring (optional but preferred)
  logic.test.ts tests for logic.ts
```

Copy an existing game that is closest to your idea (e.g. `stroop-clash` for a tap-the-answer game,
`number-ninja` or `type-defender` for things that move, `sequence-echo` for turn-based).

## The contract

```ts
// index.ts
import { icon } from './icon'

const game: GameDef = {
  meta: { id: 'my-game', skill: 'logic', icon, color: '#ff9f43', added: '2026-10-27' },
  strings,
  Component: Game,
}
```

`Game` receives `GameProps`:

- `level`: 1..10, from the player's history. Scale speed, size, number range, etc.
- `seed`: use `makeRng(seed)` for every random choice (the daily challenge relies on it).
- `t(key, vars?)`: translates keys from `strings.ts` into the player's language. Never hard-code visible text.
  For language-specific content (`content.ts`), read the language with `useLocale()` and pick `list[locale] ?? list.en`.
- `onFinish({ score, accuracy })`: call exactly once, then stop timers and ignore input.
  `accuracy >= 0.8` raises the level, `< 0.45` lowers it.

## Icons

Every game has a drawn icon in `icon.tsx`, not an emoji, so icons look the same on every phone and match the
chunky toy look. The style is **toy stickers**: flat, bright shapes with a dark ink outline, like the buttons.
The kit (`kit/icon.tsx`, CSS under `/* Game icons */` in `styles.css`) adds the outline and the drop shadow,
so an icon file only lists shapes and colours:

```tsx
import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', '#8d6e63', <rect x="29" y="26" width="7" height="19" rx="3.5" transform="rotate(-45 32.5 35.5)" />],
  ['base', '#feca57', <circle cx="20" cy="20" r="15" />],
  ['detail', '#c7ecee', <circle cx="20" cy="20" r="10" />],
  ['shine', '#fff', <path d="M13 19 A7 7 0 0 1 19 13 L19 16 A4 4 0 0 0 16 19 Z" />],
]
```

- **Grid**: 48 × 48, keep shapes inside 3 to 45 so the outline is not cut off. Parts are painted in order, back to front.
- **One object, bold shapes**: draw the thing the game is about (a drum, a monster, a map), as 3 to 6 simple
  shapes. No thin lines and no tiny details: the icon is 38 px on the daily card. Letters only when the game is about letters.
- **Roles**: `base` is the main shape, `detail` sits on top of it (eyes, holes, lights), `accent` is a secondary
  shape beside or behind it (a leaf, a handle, sticks), `shine` is a small white highlight with no outline.
- **Colours**: fixed, bright fills from the shared palette: `#ff6b6b` red, `#feca57` yellow, `#1dd1a1` green,
  `#54a0ff` blue, `#a29bfe` purple, `#ff9f43` orange, `#8d6e63` brown, `#fff` white, `#c7ecee` glass,
  and `ink` for eyes, dots and text lines. The main shape must stand out from the game's own card colour
  (a yellow cheese on a mustard card needs its outline, a blue shape on a blue card does not work).
- **Themes**: icons always sit on the game colour (cards, daily challenge) or on the intro card, and the outline
  stays dark, so the same icon works in light, dark and high contrast without changes. High contrast thickens the outline.
- Check it on the home screen in all three themes. The registry test checks every game has an icon with valid roles and colours.

## Kit pieces (`src/kit`)

- `hooks.ts`: `useCountdown(seconds, onEnd, running)`, `useGameLoop(dt => …, running)`, `useTimeouts()`,
  `usePops()`, `useShake()`, `useInterval()`.
- `ui.tsx`: `<Hud items>`, `<TimerBar>`, `<Pops>`, `<Hearts>`, `<Confetti>`.
- `sound.ts`: `sound.good(combo)`, `bad`, `pop`, `tap`, `tick`, `win`, `tone(freq, dur)`, `vibrate(ms)`. Real recordings: `preloadClip(url)` + `playClip(url)` (import the file from the game folder; keep clips tiny and list their source and licence in a `sounds/CREDITS.md`).
- `random.ts`: `makeRng(seed)` with `int`, `pick`, `shuffle`, `chance`; `clamp`.
- Shared CSS classes in `src/styles.css`: `.game`, `.prompt`, `.choices`, `.choice-btn`, `.big-btn`.
  Game-specific CSS goes at the end of `styles.css` under a `/* <Game title> */` comment, with a short class prefix.
  Use `var(--game-color)` for the game's accent, and `var(--game-text)` when the accent colours text.
- `theme.ts`: light, dark and high contrast themes. Never hard-code page colours: use the theme variables at
  the top of `styles.css` (`--bg`, `--ink`, `--muted`, `--card`, `--line`, `--good`, `--bad`, `--good-soft`,
  `--bad-soft`, `--highlight`, `--on-color` for text on coloured buttons, `--press` for button edges).
  Fixed colours are fine inside a game's own scene (a sky, a pond, game pieces); text on a surface that stays
  light in every theme uses `--ink-fixed`. Check your game in all three themes with the ☀️ button on the home screen.

## Translations

The app speaks English (`en`) and Hungarian (`hu`); kids switch with the EN/HU button on the home screen.
Every new game must ship both:

- `strings.ts` has an `en` and a `hu` block with the same keys and the same `{placeholders}`. Write natural,
  child-friendly Hungarian (tegezés: "Koppints…", "Keresd…"), not word-for-word English. `src/i18n/i18n.test.ts`
  fails if a key is missing.
- Hungarian grammar changes words: avoid gluing suffixes onto placeholders (`{n}-t`), rephrase instead
  ("Pontosan ennyit kérek: {n}!"). When a word must be inflected, add a separate key for that form (see
  `simon-says`: `dog.tap` = "kutyára"). Names that need an article carry it ("az USA", "a Fülöp-szigetek").
- Word, picture, sentence, story or country content gets its own `hu` list in `content.ts`, written for Hungarian
  kids, not translated letter for letter. It needs the same amount per level as English (the fun checklist rule 8),
  and level rules based on word length must still give enough Hungarian words at every level. Accented letters
  (á, é, ő, ű…) are fine; keep text NFC normalised.
- A brand-new language: add `xx.ts` next to `src/i18n/en.ts`, register it in `src/i18n/index.ts`, add `lang.xx`
  to every dictionary, then an `xx` block to every game's `strings.ts` and `content.ts`.

## Before opening a PR

```
npm test          # registry test mounts every game in every language and taps every button
npm run build     # type-check + production build
```

Then play it in `npm run dev` on a phone-sized window, in English and in Hungarian. If it isn't fun, change it before shipping.
Finally, move the idea from "Up next" to "Shipped" in `GAME_IDEAS.md`.
