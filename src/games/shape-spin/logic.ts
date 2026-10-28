import type { Rng } from '../../kit/random'

export type Cells = [number, number][]

// Shapes that look different when mirrored, so a mirrored copy is a fair "trick" answer.
// No shape is a turn or a flip of another one (checked in the tests).
export const shapes: Cells[] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]], // L
  [[1, 0], [2, 0], [0, 1], [1, 1]], // S
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], // F
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], // P
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], // N
  [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3]], // Y
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], // long L
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]], // Z
  // Six squares: unlocked at higher levels.
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3]], // big L
  [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]], // long S
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]], // stairs
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [1, 1]], // boot
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]], // snake
  [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2], [0, 3]], // comb
  [[1, 0], [1, 1], [0, 1], [0, 2], [0, 3], [1, 3]], // hook
  [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [1, 4]], // long N
]

/** Small shapes for the youngest players, the six-square ones from level 5. */
export const shapesForLevel = (level: number) => shapes.filter((s) => level >= 5 || s.length <= 5)

export function normalize(cells: Cells): Cells {
  const minX = Math.min(...cells.map((c) => c[0]))
  const minY = Math.min(...cells.map((c) => c[1]))
  return cells.map(([x, y]) => [x - minX, y - minY] as [number, number]).sort((a, b) => a[1] - b[1] || a[0] - b[0])
}

export const key = (cells: Cells) => normalize(cells).map((c) => c.join(',')).join(';')
export const rotate = (cells: Cells): Cells => normalize(cells.map(([x, y]) => [-y, x]))
export const mirror = (cells: Cells): Cells => normalize(cells.map(([x, y]) => [-x, y]))

export function rotations(cells: Cells): Cells[] {
  const out = [normalize(cells)]
  for (let i = 0; i < 3; i++) out.push(rotate(out[out.length - 1]))
  return out
}

/** True if `b` is `a` turned (not flipped). */
export function sameShape(a: Cells, b: Cells) {
  const k = key(b)
  return rotations(a).some((r) => key(r) === k)
}

export interface Puzzle {
  target: Cells
  options: Cells[]
  answer: number
}

export function makePuzzle(rng: Rng, level: number): Puzzle {
  const pool = shapesForLevel(level)
  const base = rng.pick(pool)
  const target = rng.pick(rotations(base))
  // The right answer is always turned, never shown the same way up.
  const answerShape = rng.pick(rotations(base).filter((r) => key(r) !== key(target)))
  const distractors: Cells[] = []
  if (level >= 3) distractors.push(rng.pick(rotations(mirror(base))))
  // Distractors with the same number of squares come first, so counting squares is not enough.
  const others = rng.shuffle(pool.filter((s) => s !== base)).sort((a, b) => Number(a.length === base.length) - Number(b.length === base.length))
  const wrongCount = level >= 7 ? 3 : 2
  while (distractors.length < wrongCount) {
    const s = others.pop()!
    distractors.push(rng.pick(rotations(level >= 6 ? mirror(s) : s)))
  }
  const options = rng.shuffle([answerShape, ...distractors])
  return { target, options, answer: options.indexOf(answerShape) }
}
