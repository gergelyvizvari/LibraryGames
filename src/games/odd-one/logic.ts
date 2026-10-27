import { clamp, type Rng } from '../../kit/random'

// [common, odd] pairs, from very different (easy) to look-alikes (hard).
export const easyPairs: [string, string][] = [
  ['🍎', '🍌'], ['🐶', '🐸'], ['⭐', '🌙'], ['🚗', '🚀'], ['🌸', '🍄'], ['🐟', '🐦'], ['⚽', '🎈'],
]
export const hardPairs: [string, string][] = [
  ['😀', '😃'], ['🍎', '🍅'], ['🐱', '🐯'], ['🌕', '🌝'], ['🔵', '🟣'], ['🐻', '🐼'], ['🍊', '🍑'],
  ['🌲', '🌳'], ['😺', '😸'], ['🐭', '🐹'], ['🙂', '🙃'], ['🍋', '🍌'], ['🐢', '🦎'], ['💛', '🧡'],
]

/** Grid side length: grows as you find more in a round, and starts bigger at higher levels. */
export function gridSize(level: number, found: number) {
  return clamp(3 + Math.floor(level / 3) + Math.floor(found / 3), 3, 7)
}

export interface Board {
  size: number
  common: string
  odd: string
  oddIndex: number
}

export function makeBoard(rng: Rng, level: number, found: number): Board {
  const size = gridSize(level, found)
  const hardChance = clamp((level - 1) * 0.15 + found * 0.04, 0, 0.9)
  const [common, odd] = rng.pick(rng.chance(hardChance) ? hardPairs : easyPairs)
  return { size, common, odd, oddIndex: rng.int(0, size * size - 1) }
}
