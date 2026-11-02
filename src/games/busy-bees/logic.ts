import { clamp, type Rng } from '../../kit/random'

/** Turns in one round. A turn is about 7 to 9 seconds, so a round lasts about a minute. */
export const TURNS = 8
/** How long the bee(s) to follow glow before they fly, in ms. */
export const SHOW_MS = 1700

export interface Point {
  x: number
  y: number
}

export interface Turn {
  /** One path per bee: waypoints in 0..1 coordinates; the bee rests on the first and last. */
  paths: Point[][]
  /** Indexes of the bees to follow. */
  targets: number[]
  /** Time for one leg of the flight, in ms. */
  legMs: number
}

const lv = (level: number) => clamp(Math.round(level), 1, 10)

/** How many bees buzz around: 3 at level 1, 8 at level 10. */
export const beeCount = (level: number) => [3, 3, 4, 4, 5, 5, 6, 6, 7, 8][lv(level) - 1]

/** How many bees to follow at once: one, then two from level 6. */
export const targetCount = (level: number) => (lv(level) >= 6 ? 2 : 1)

/** How many hops each bee makes before landing. */
export const legCount = (level: number) => [2, 2, 3, 3, 4, 4, 5, 5, 6, 6][lv(level) - 1]

/** Time per hop, in ms: slow at level 1, quick at level 10. */
export const legMs = (level: number) => 1300 - (lv(level) - 1) * 60

/** Total flight time in ms. */
export const flightMs = (level: number) => legCount(level) * legMs(level)

/** Centres of a 3 × 3 grid of cells. Bees always sit in different cells, so they never overlap at rest. */
const CELLS: Point[] = [0.18, 0.5, 0.82].flatMap((y) => [0.18, 0.5, 0.82].map((x) => ({ x, y })))

/** n spots in different cells, each nudged a little so the grid does not show. */
export function spreadPoints(rng: Rng, n: number): Point[] {
  return rng
    .shuffle(CELLS)
    .slice(0, n)
    .map((c) => ({ x: c.x + (rng.next() - 0.5) * 0.1, y: c.y + (rng.next() - 0.5) * 0.1 }))
}

export function makeTurn(rng: Rng, level: number): Turn {
  const n = beeCount(level)
  const legs = legCount(level)
  // Each waypoint is a fresh spread of all bees, so bees criss-cross but every stop is clear.
  const stops = Array.from({ length: legs + 1 }, () => spreadPoints(rng, n))
  const paths = Array.from({ length: n }, (_, b) => stops.map((s) => s[b]))
  const targets = rng.shuffle(paths.map((_, i) => i)).slice(0, targetCount(level))
  return { paths, targets, legMs: legMs(level) }
}

const ease = (f: number) => f * f * (3 - 2 * f)

/** Where a bee is after `ms` of flight, and which way it faces (-1 left, 1 right). */
export function positionAt(path: Point[], ms: number, leg: number): Point & { dir: number } {
  const legs = path.length - 1
  if (ms <= 0) return { ...path[0], dir: Math.sign(path[1].x - path[0].x) || 1 }
  if (ms >= legs * leg) return { ...path[legs], dir: Math.sign(path[legs].x - path[legs - 1].x) || 1 }
  const i = Math.floor(ms / leg)
  const f = ease((ms - i * leg) / leg)
  const a = path[i]
  const b = path[i + 1]
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, dir: Math.sign(b.x - a.x) || 1 }
}

/** Points for finding a bee: more at higher levels and for a streak of turns without a mistake. */
export const pointsFor = (level: number, combo: number) => 10 + lv(level) * 2 + Math.min(Math.max(combo - 1, 0), 5) * 4
