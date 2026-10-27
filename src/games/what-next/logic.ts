import type { Rng } from '../../kit/random'

export const symbolSets = [
  ['🍎', '🍌', '🍇', '🍊', '🍓'],
  ['🐶', '🐱', '🐭', '🐰', '🐸'],
  ['🔴', '🔵', '🟢', '🟡', '🟣'],
  ['⭐', '🌙', '☀️', '☁️', '⚡'],
  ['🚗', '🚌', '🚲', '🚀', '⛵'],
]

/** Repeating units, easiest first. Letters stand for different symbols. */
export const patterns = ['AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABAC', 'ABCB', 'AABC', 'ABCD', 'ABBC', 'AABBC', 'ABCDE']

export function patternsForLevel(level: number) {
  return patterns.slice(0, Math.min(patterns.length, 2 + level))
}

export interface Puzzle {
  shown: string[]
  answer: string
  options: string[]
}

export function makePuzzle(rng: Rng, level: number): Puzzle {
  const unit = rng.pick(patternsForLevel(level))
  const symbols = rng.shuffle(rng.pick(symbolSets))
  const letters = [...new Set(unit)]
  const map = new Map(letters.map((l, i) => [l, symbols[i]]))
  // Show at least two full repeats, then stop at a random point in the unit.
  const length = unit.length * 2 + rng.int(0, unit.length - 1)
  const seq = Array.from({ length: length + 1 }, (_, i) => map.get(unit[i % unit.length])!)
  const answer = seq[length]
  const pool = [...new Set([...letters.map((l) => map.get(l)!), ...symbols])]
  const wrong = rng.shuffle(pool.filter((s) => s !== answer)).slice(0, 2)
  return { shown: seq.slice(0, length), answer, options: rng.shuffle([answer, ...wrong]) }
}
