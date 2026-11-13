import { clamp, type Rng } from '../../kit/random'

/** Boards of balloons in one stage. */
export const STAGE = 5

export interface Spec {
  /** Balloons on the board. */
  count: number
  /** Their numbers go up to this. */
  max: number
  /** Seconds the numbers stay before they hide, or null: they stay until the first pop. */
  show: number | null
}

const SPECS: Spec[] = [
  { count: 3, max: 3, show: null },
  { count: 3, max: 6, show: null },
  { count: 4, max: 9, show: 4 },
  { count: 4, max: 12, show: 3.5 },
  { count: 5, max: 15, show: 4.5 },
  { count: 5, max: 20, show: 4 },
  { count: 5, max: 30, show: 3.5 },
  { count: 6, max: 30, show: 4.5 },
  { count: 6, max: 50, show: 4 },
  { count: 6, max: 99, show: 3.5 },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

/** Where the balloons float, as fractions of the field: a gentle zigzag so no string crosses a balloon. */
const SPOTS: Record<number, [number, number][]> = {
  3: [[0.2, 0.42], [0.5, 0.3], [0.8, 0.42]],
  4: [[0.17, 0.4], [0.39, 0.27], [0.61, 0.4], [0.83, 0.27]],
  5: [[0.13, 0.4], [0.32, 0.25], [0.5, 0.4], [0.68, 0.25], [0.87, 0.4]],
  6: [[0.11, 0.38], [0.27, 0.24], [0.42, 0.38], [0.58, 0.24], [0.73, 0.38], [0.89, 0.24]],
}

export interface Balloon {
  n: number
  x: number
  y: number
  color: number
}

export const COLORS = 6

/** A board: distinct numbers on balloons in shuffled spots and colours. Level 1 is always 1, 2 and 3. */
export function dealBoard(rng: Rng, level: number): Balloon[] {
  const { count, max } = specFor(level)
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const numbers = max === count ? pool : rng.shuffle(pool).slice(0, count)
  const spots = SPOTS[count]
  const colors = rng.shuffle(Array.from({ length: COLORS }, (_, i) => i))
  // A little sway in height so the row looks blown by the wind, not ruled.
  return rng.shuffle(numbers).map((n, i) => ({ n, x: spots[i][0], y: spots[i][1] + (rng.next() - 0.5) * 0.06, color: colors[i] }))
}

/** The number that has to be popped next, once `popped` balloons are gone. */
export const nextNumber = (board: Balloon[], popped: number) => board.map((b) => b.n).sort((a, b) => a - b)[popped]
