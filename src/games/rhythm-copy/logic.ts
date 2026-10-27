import { clamp, type Rng } from '../../kit/random'

export const ROUNDS = 8

/** Beat lengths in "steps"; a step is one eighth note. Short ones make the rhythm interesting. */
const lengths = [2, 2, 2, 1, 1, 4, 3]

export function stepMs(level: number) {
  return clamp(300 - level * 10, 200, 300)
}

/** Number of hits in a pattern: grows over the round and with the level. */
export function hitsFor(level: number, round: number) {
  return clamp(3 + Math.floor(level / 3) + Math.floor(round / 3), 3, 8)
}

/** Times of each hit in ms from the first one. */
export function makePattern(rng: Rng, level: number, round: number): number[] {
  const step = stepMs(level)
  const n = hitsFor(level, round)
  const times = [0]
  // Low levels use only even beats; quicker "1" steps come in from level 3.
  const pool = level < 3 ? [2, 2, 4] : lengths
  for (let i = 1; i < n; i++) times.push(times[i - 1] + rng.pick(pool) * step)
  return times
}

/**
 * How closely the taps follow the pattern, 0..1. Compares the gaps between hits,
 * so starting a little late doesn't matter, only the rhythm does.
 */
export function rhythmScore(pattern: number[], taps: number[]) {
  if (taps.length !== pattern.length) return 0
  if (pattern.length < 2) return 1
  let total = 0
  for (let i = 1; i < pattern.length; i++) {
    const want = pattern[i] - pattern[i - 1]
    const got = taps[i] - taps[i - 1]
    // Within 25% of the gap is perfect, 70% off or worse scores nothing.
    const off = Math.abs(got - want) / want
    total += clamp(1 - (off - 0.25) / 0.45, 0, 1)
  }
  return total / (pattern.length - 1)
}

export function grade(score: number): 'perfect' | 'great' | 'good' | 'oops' {
  return score >= 0.9 ? 'perfect' : score >= 0.7 ? 'great' : score >= 0.45 ? 'good' : 'oops'
}
