import { clamp, type Rng } from '../../kit/random'

export interface Puzzle {
  rows: number
  /** Columns on each side of the mirror. */
  half: number
  /** Coloured cells on the left side, as row * half + col. */
  left: number[]
}

export function makePuzzle(rng: Rng, level: number, solved: number): Puzzle {
  const half = level + solved >= 6 ? 4 : 3
  const rows = half + 2
  const count = clamp(2 + Math.floor(level / 2) + solved, 2, rows * half - 2)
  const left = rng.shuffle(Array.from({ length: rows * half }, (_, i) => i)).slice(0, count)
  return { rows, half, left }
}

/** The right-side cell (row * half + col, counted from the mirror) that mirrors a left cell. */
export function mirrorOf(p: Puzzle, leftCell: number) {
  const row = Math.floor(leftCell / p.half)
  const col = leftCell % p.half
  return row * p.half + (p.half - 1 - col)
}

export const targets = (p: Puzzle) => p.left.map((c) => mirrorOf(p, c))
