import type { Rng } from '../../kit/random'

export type Cells = [number, number][]

// Shapes that look different when mirrored, so a mirrored copy is a fair "trick" answer.
export const shapes: Cells[] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]], // L
  [[1, 0], [2, 0], [0, 1], [1, 1]], // S
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], // F
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], // P
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], // N
  [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3]], // Y
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], // long L
]

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
  const base = rng.pick(shapes)
  const target = rng.pick(rotations(base))
  // The right answer is always turned, never shown the same way up.
  const answerShape = rng.pick(rotations(base).filter((r) => key(r) !== key(target)))
  const distractors: Cells[] = []
  if (level >= 3) distractors.push(rng.pick(rotations(mirror(base))))
  const others = rng.shuffle(shapes.filter((s) => s !== base))
  while (distractors.length < 2) {
    const s = others.pop()!
    distractors.push(rng.pick(rotations(level >= 6 ? mirror(s) : s)))
  }
  const options = rng.shuffle([answerShape, ...distractors])
  return { target, options, answer: options.indexOf(answerShape) }
}
