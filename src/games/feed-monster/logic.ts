import { clamp, type Rng } from '../../kit/random'

/** A stage is this many monsters to feed. There is no clock. */
export const STAGE = 5

export interface Monster {
  target: number
  blocks: number[]
  /** Fewest blocks that add up to the target. */
  best: number
}

export function targetRange(level: number): [number, number] {
  return [clamp(2 + level, 3, 10), clamp(5 + level * 2, 6, 20)]
}

/** Fewest blocks (each usable many times) that sum to `n`, or Infinity if it can't be done. */
export function fewestBlocks(n: number, blocks: number[]) {
  const best = [0]
  for (let i = 1; i <= n; i++) {
    best[i] = Infinity
    for (const b of blocks) if (b <= i) best[i] = Math.min(best[i], best[i - b] + 1)
  }
  return best[n]
}

/** Can `left` still be filled exactly with these blocks? */
export const canFinish = (left: number, blocks: number[]) => fewestBlocks(left, blocks) < Infinity

export function makeMonster(rng: Rng, level: number): Monster {
  const count = level < 4 ? 3 : 4
  const top = clamp(3 + level, 3, 9)
  // Keep a 1 on early levels so every leftover can be fixed.
  const set = new Set<number>(level < 6 ? [1] : [])
  while (set.size < count) set.add(rng.int(level < 6 ? 2 : 1, top))
  const blocks = [...set].sort((a, b) => a - b)
  const [lo, hi] = targetRange(level)
  let target = rng.int(lo, hi)
  // A target equal to one block is too easy; a target out of reach is unfair.
  while (blocks.includes(target) || !canFinish(target, blocks)) target = rng.int(lo, hi)
  return { target, blocks, best: fewestBlocks(target, blocks) }
}

/** Points for a full monster: more for using the fewest blocks. */
export function pointsFor(m: Monster, used: number, combo: number) {
  const base = 10 + m.target
  const bonus = used <= m.best ? 15 : 0
  return base + bonus + Math.min(combo, 5) * 2
}
