import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { accuracyFor, clashes, conflicts, hintFor, isSolved, makePuzzle, pointsFor, puzzlesFor, sizeFor, solve, type Cell } from './logic'

const cellsOf = (solution: number[]): Cell[] => solution.map((c, r) => [r, c])

describe('crown garden puzzles', () => {
  it('grows from 4 × 4 at level 1 to 8 × 8 at level 10', () => {
    expect(sizeFor(1)).toBe(4)
    expect(sizeFor(10)).toBe(8)
    for (let l = 1; l < 10; l++) expect(sizeFor(l + 1)).toBeGreaterThanOrEqual(sizeFor(l))
    expect(puzzlesFor(1)).toBe(3)
    expect(puzzlesFor(10)).toBe(2)
  })

  it.each([4, 5, 6, 7, 8])('makes gardens %i cells wide with exactly one answer', (n) => {
    for (let seed = 1; seed <= 25; seed++) {
      const p = makePuzzle(makeRng(seed * 977 + n), n)
      // n beds, each one connected and holding exactly one crown of the answer.
      const beds = new Set(p.regions.flat())
      expect(beds.size).toBe(n)
      for (const bed of beds) {
        const cells = p.regions.flatMap((row, r) => row.flatMap((b, c) => (b === bed ? [[r, c]] : [])))
        const seen = new Set([cells[0].join()])
        const stack = [cells[0]]
        while (stack.length) {
          const [r, c] = stack.pop()!
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = `${r + dr},${c + dc}`
            if (p.regions[r + dr]?.[c + dc] === bed && !seen.has(k)) {
              seen.add(k)
              stack.push([r + dr, c + dc])
            }
          }
        }
        expect(seen.size).toBe(cells.length)
      }
      const answers = solve(p.regions, 5)
      expect(answers).toEqual([p.solution])
      expect(isSolved(p.regions, cellsOf(p.solution))).toBe(true)
    }
  })

  it('is the same garden for the same seed', () => {
    expect(makePuzzle(makeRng(7), 6)).toEqual(makePuzzle(makeRng(7), 6))
  })

  it('spots crowns that share a row, column or bed, or touch', () => {
    const regions = [
      [0, 0, 1, 1],
      [0, 2, 2, 1],
      [3, 2, 2, 1],
      [3, 3, 3, 3],
    ]
    expect(conflicts(regions, [[0, 0], [0, 3]]).size).toBe(2) // same row
    expect(conflicts(regions, [[0, 0], [2, 0]]).size).toBe(2) // same column
    expect(conflicts(regions, [[3, 0], [3, 3]]).size).toBe(2) // same row and bed
    expect(conflicts(regions, [[0, 1], [1, 2]]).size).toBe(2) // touching corners
    expect(conflicts(regions, [[0, 1], [2, 3]]).size).toBe(0)
    expect(clashes(regions, [[0, 1]], 1, 2)).toBe(true)
    expect(clashes(regions, [[0, 1]], 2, 3)).toBe(false)
    expect(clashes(regions, [[0, 1]], 0, 1)).toBe(false) // a crown does not clash with itself
  })

  it('gives hints that fix a wrong crown first, then add a right one', () => {
    const p = makePuzzle(makeRng(3), 5)
    const wrongCol = (p.solution[0] + 2) % 5
    expect(hintFor(p, [[0, wrongCol]])).toEqual({ remove: [0, wrongCol] })
    expect(hintFor(p, [])).toEqual({ add: [0, p.solution[0]] })
    expect(hintFor(p, cellsOf(p.solution))).toBeNull()
  })

  it('scores clean gardens higher and keeps accuracy honest', () => {
    expect(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 2)).toBeGreaterThan(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 1))
    expect(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 1)).toBeGreaterThan(pointsFor({ n: 6, mistakes: 1, hints: 0 }, 1))
    expect(pointsFor({ n: 4, mistakes: 40, hints: 4 }, 0)).toBe(20)
    expect(accuracyFor([{ n: 4, mistakes: 0, hints: 0 }])).toBe(1)
    expect(accuracyFor([{ n: 4, mistakes: 10, hints: 4 }])).toBe(0)
    expect(accuracyFor([])).toBe(0)
  })
})
