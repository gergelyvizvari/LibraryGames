import { clamp, type Rng } from '../../kit/random'

export const ROUNDS = 10

export function countRange(level: number): [number, number] {
  return [clamp(2 + level, 3, 10), clamp(5 + level * 2, 7, 25)]
}

/** How long the dots stay visible, in ms. */
export const flashMs = (level: number) => clamp(2200 - level * 160, 700, 2200)

export interface Dot {
  x: number
  y: number
}

/** Non-overlapping dots, as percentages of the board. */
export function makeDots(rng: Rng, n: number): Dot[] {
  const dots: Dot[] = []
  let tries = 0
  while (dots.length < n && tries++ < 5000) {
    const d = { x: rng.int(8, 92), y: rng.int(8, 92) }
    if (dots.every((o) => Math.hypot(o.x - d.x, o.y - d.y) > 13)) dots.push(d)
  }
  return dots
}

/** Four nearby answers including the right one. */
export function options(rng: Rng, n: number) {
  const set = new Set([n])
  while (set.size < 4) set.add(Math.max(1, n + rng.pick([-3, -2, -1, 1, 2, 3])))
  return [...set].sort((a, b) => a - b)
}

export function pointsFor(guess: number, n: number) {
  const off = Math.abs(guess - n)
  return off === 0 ? 20 : off === 1 ? 5 : 0
}
