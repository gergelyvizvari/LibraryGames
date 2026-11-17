import { clamp, type Rng } from '../../kit/random'

/** Bridges to mend in one stage. */
export const STAGE = 5

/** The bridge deck between the two cliffs, in scene units. */
export const DECK_LEFT = 60
export const DECK_RIGHT = 340
export const DECK = DECK_RIGHT - DECK_LEFT

/** The longest plank that fits on the grass below, in scene units. */
export const MAX_PLANK = 340
export const MIN_PLANK = 34

export interface Spec {
  choices: number
  /** How much the planks differ, as a share of the gap: big at first, small later. */
  diff: number
  /** How far a plank on the grass may be turned, in degrees. */
  tilt: number
  /** Whether the planks lie lined up at the left (easy to compare) or scattered. */
  scatter: boolean
}

const SPECS: Spec[] = [
  { choices: 3, diff: 0.55, tilt: 0, scatter: false },
  { choices: 3, diff: 0.45, tilt: 0, scatter: false },
  { choices: 3, diff: 0.38, tilt: 0, scatter: true },
  { choices: 3, diff: 0.32, tilt: 3, scatter: true },
  { choices: 4, diff: 0.28, tilt: 3, scatter: true },
  { choices: 4, diff: 0.23, tilt: 5, scatter: true },
  // Never closer than 15% of the gap: on a phone a smaller difference is hard to see, even more so on a tilted plank.
  { choices: 4, diff: 0.2, tilt: 6, scatter: true },
  { choices: 4, diff: 0.18, tilt: 7, scatter: true },
  { choices: 4, diff: 0.16, tilt: 8, scatter: true },
  { choices: 4, diff: 0.15, tilt: 8, scatter: true },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

export interface Plank {
  length: number
  /** Where the plank lies on the grass: its left end, in scene units, and how far it is turned. */
  x: number
  tilt: number
  /** Which wood colour it has. */
  wood: number
}

export interface Task {
  /** The gap in the deck: where it starts and how long it is. */
  gapAt: number
  gap: number
  planks: Plank[]
  /** Which plank fits. */
  fits: number
}

/** How a plank compares to the gap. */
export const fit = (plank: number, gap: number): 'short' | 'exact' | 'long' => (Math.abs(plank - gap) < 0.5 ? 'exact' : plank < gap ? 'short' : 'long')

export function makeTask(rng: Rng, level: number, lastGap = 0): Task {
  const spec = specFor(level)
  let gap = Math.round(rng.int(Math.round(DECK * 0.24), Math.round(DECK * 0.52)))
  if (Math.abs(gap - lastGap) < 12) gap = gap > DECK * 0.38 ? gap - 30 : gap + 30
  const gapAt = DECK_LEFT + Math.round(rng.int(20, DECK - gap - 20))
  // Other planks are whole steps of `diff` shorter or longer, so no two lie closer than one step.
  const steps = rng.shuffle([-2, -1, 1, 2, 3]).filter((k) => {
    const len = gap * (1 + k * spec.diff)
    return len >= MIN_PLANK && len <= MAX_PLANK
  })
  const lengths = [gap, ...steps.slice(0, spec.choices - 1).map((k) => Math.round(gap * (1 + k * spec.diff)))]
  const order = rng.shuffle(lengths.map((_, i) => i))
  const planks = order.map((i, n) => {
    const length = lengths[i]
    const x = spec.scatter ? rng.int(30, Math.max(30, 400 - 30 - length)) : 30
    const tilt = spec.tilt ? rng.int(-spec.tilt, spec.tilt) : 0
    return { length, x, tilt, wood: n % 3 }
  })
  return { gapAt, gap, planks, fits: order.indexOf(0) }
}
