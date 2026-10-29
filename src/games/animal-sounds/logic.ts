import { clamp, type Rng } from '../../kit/random'

export const ROUNDS = 8
export const LIVES = 3

export const ANIMALS = ['cat', 'dog', 'cow', 'duck', 'bird', 'frog'] as const
export type Animal = (typeof ANIMALS)[number]

/** How many animals are on the farm. */
export const animalCount = (level: number) => (level <= 2 ? 3 : level <= 5 ? 4 : 6)

/** Animals light up while they call on easy levels; later it's ears only. */
export const showLights = (level: number) => level < 5

export const stepMs = (level: number) => clamp(950 - level * 40, 600, 950)

export function seqLength(level: number, round: number) {
  return clamp(2 + Math.floor(level / 3) + Math.floor(round / 3), 2, 7)
}

/** A random call order, never the same animal three times in a row. */
export function makeSequence(rng: Rng, length: number, count: number) {
  const seq: number[] = []
  while (seq.length < length) {
    const a = rng.int(0, count - 1)
    const n = seq.length
    if (n >= 2 && seq[n - 1] === a && seq[n - 2] === a) continue
    seq.push(a)
  }
  return seq
}

/** Points for a finished sequence: longer is worth more, a replay halves it. */
export function roundPoints(length: number, replayed: boolean, combo: number) {
  const base = length * 10 + Math.min(combo, 5) * 5
  return replayed ? Math.round(base / 2) : base
}
