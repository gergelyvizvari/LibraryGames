import { clamp, type Rng } from '../../kit/random'

export const DURATION = 60
/** Ticks shown at once: a window of the line, so every tick stays big enough to tap on a phone. */
export const WINDOW = 10

export type Labels = 'all' | 'fives' | 'start'

export interface Spec {
  /** The line runs from 0 to max. */
  max: number
  /** Jumps per question: one, or two in a row from level 8. */
  steps: number
  minJump: number
  maxJump: number
  /** Whether jumps can go backwards. */
  back: boolean
  labels: Labels
}

const SPECS: Spec[] = [
  { max: 10, steps: 1, minJump: 1, maxJump: 3, back: false, labels: 'all' },
  { max: 10, steps: 1, minJump: 1, maxJump: 3, back: true, labels: 'all' },
  { max: 10, steps: 1, minJump: 1, maxJump: 5, back: true, labels: 'all' },
  { max: 20, steps: 1, minJump: 2, maxJump: 6, back: true, labels: 'all' },
  { max: 50, steps: 1, minJump: 2, maxJump: 8, back: true, labels: 'fives' },
  { max: 50, steps: 1, minJump: 3, maxJump: 9, back: true, labels: 'fives' },
  { max: 100, steps: 1, minJump: 2, maxJump: 9, back: true, labels: 'start' },
  { max: 100, steps: 2, minJump: 1, maxJump: 5, back: true, labels: 'fives' },
  { max: 100, steps: 2, minJump: 2, maxJump: 7, back: true, labels: 'start' },
  { max: 100, steps: 2, minJump: 3, maxJump: 9, back: true, labels: 'start' },
]
export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

export interface Question {
  start: number
  jumps: number[]
  end: number
  /** First number in the visible window; the window shows lo to lo + WINDOW. */
  lo: number
}

/** Every stop on the way, start and end included. */
export const pathOf = (q: Pick<Question, 'start' | 'jumps'>) =>
  q.jumps.reduce((acc, j) => [...acc, acc[acc.length - 1] + j], [q.start])

/**
 * A question that starts where the frog stands. Every stop stays on the line and all of them fit in one window,
 * so the answer is always a tick the player can see.
 */
export function makeQuestion(rng: Rng, level: number, start: number): Question {
  const s = specFor(level)
  const from = clamp(start, 0, s.max)
  for (let tries = 0; tries < 200; tries++) {
    const jumps: number[] = []
    let at = from
    let ok = true
    for (let k = 0; k < s.steps; k++) {
      const size = rng.int(s.minJump, s.maxJump)
      // Go back when forwards would leave the line, otherwise pick at random (forwards a bit more often).
      const back = s.back && (at + size > s.max || (at - size >= 0 && rng.chance(0.45)))
      const j = back ? -size : size
      if (at + j < 0 || at + j > s.max) {
        ok = false
        break
      }
      jumps.push(j)
      at += j
    }
    if (!ok || at === from) continue
    const path = pathOf({ start: from, jumps })
    const lowest = Math.min(...path)
    const highest = Math.max(...path)
    if (highest - lowest > WINDOW) continue
    const loMin = Math.max(0, highest - WINDOW)
    const loMax = Math.min(lowest, s.max - WINDOW)
    const lo = rng.int(loMin, Math.max(loMin, loMax))
    return { start: from, jumps, end: at, lo }
  }
  // A frog stuck at the far end: start it again near the beginning.
  return makeQuestion(rng, level, rng.int(0, Math.min(3, s.max)))
}

/** Which ticks show their number. Hidden ones make the player count the hops. */
export function showsLabel(n: number, q: Question, labels: Labels) {
  if (n === q.start || labels === 'all') return true
  if (labels === 'fives') return n % 5 === 0
  return false
}

export const jumpText = (j: number) => (j > 0 ? `+${j}` : `−${-j}`)

/** Streaks and quick answers earn more. */
export const pointsFor = (combo: number, seconds: number) => 10 + Math.min(combo, 10) * 2 + clamp(Math.round((5 - seconds) * 1.5), 0, 6)

export const accuracyFor = (right: number, wrong: number) =>
  clamp(right / Math.max(1, right + wrong), 0, 1) * clamp(right / 12, 0, 1)
