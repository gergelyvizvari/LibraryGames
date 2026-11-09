import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { accuracyFor, clashes, conflicts, giftsFor, hintFor, isSolved, makePuzzle, pointsFor, puzzlesFor, ruleBroken, ruleCells, sizeFor, solve, starved, type Cell } from './logic'

const cellsOf = (solution: number[]): Cell[] => solution.map((c, r) => [r, c])

describe('puppy spots puzzles', () => {
  it('grows from 4 × 4 at level 1 to 8 × 8 at level 10', () => {
    expect(sizeFor(1)).toBe(4)
    expect(sizeFor(10)).toBe(8)
    for (let l = 1; l < 10; l++) expect(sizeFor(l + 1)).toBeGreaterThanOrEqual(sizeFor(l))
    expect(puzzlesFor(1)).toBe(3)
    expect(puzzlesFor(10)).toBe(2)
  })

  it.each([4, 5, 6, 7, 8])('makes rooms %i cells wide with exactly one answer', (n) => {
    for (let seed = 1; seed <= 25; seed++) {
      const p = makePuzzle(makeRng(seed * 977 + n), n)
      // n rugs, each one connected and holding exactly one pup of the answer.
      const rugs = new Set(p.regions.flat())
      expect(rugs.size).toBe(n)
      for (const rug of rugs) {
        const cells = p.regions.flatMap((row, r) => row.flatMap((b, c) => (b === rug ? [[r, c]] : [])))
        const seen = new Set([cells[0].join()])
        const stack = [cells[0]]
        while (stack.length) {
          const [r, c] = stack.pop()!
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = `${r + dr},${c + dc}`
            if (p.regions[r + dr]?.[c + dc] === rug && !seen.has(k)) {
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

  it('is the same room for the same seed', () => {
    expect(makePuzzle(makeRng(7), 6)).toEqual(makePuzzle(makeRng(7), 6))
  })

  it('spots pups that share a row, column or rug, or touch', () => {
    const regions = [
      [0, 0, 1, 1],
      [0, 2, 2, 1],
      [3, 2, 2, 1],
      [3, 3, 3, 3],
    ]
    expect(conflicts(regions, [[0, 0], [0, 3]]).size).toBe(2) // same row
    expect(conflicts(regions, [[0, 0], [2, 0]]).size).toBe(2) // same column
    expect(conflicts(regions, [[3, 0], [3, 3]]).size).toBe(2) // same row and rug
    expect(conflicts(regions, [[0, 1], [1, 2]]).size).toBe(2) // touching corners
    expect(conflicts(regions, [[0, 1], [2, 3]]).size).toBe(0)
    expect(clashes(regions, [[0, 1]], 1, 2)).toBe(true)
    expect(clashes(regions, [[0, 1]], 2, 3)).toBe(false)
    expect(clashes(regions, [[0, 1]], 0, 1)).toBe(false) // a pup does not clash with itself
  })

  it('says which rule a pup breaks and which squares show it', () => {
    const regions = [
      [0, 0, 1, 1],
      [0, 2, 2, 1],
      [3, 2, 2, 1],
      [3, 3, 3, 3],
    ]
    expect(ruleBroken(regions, [[0, 0]], 0, 3)).toEqual({ rule: 'row', other: [0, 0] })
    expect(ruleBroken(regions, [[0, 0]], 2, 0)).toEqual({ rule: 'col', other: [0, 0] })
    expect(ruleBroken(regions, [[1, 1]], 2, 2)).toEqual({ rule: 'rug', other: [1, 1] })
    expect(ruleBroken(regions, [[0, 1]], 1, 2)).toEqual({ rule: 'touch', other: [0, 1] })
    expect(ruleBroken(regions, [[0, 1]], 2, 3)).toBeNull()
    expect(ruleCells(regions, 'row', [0, 3], [0, 0])).toHaveLength(4)
    expect(ruleCells(regions, 'rug', [2, 2], [1, 1])).toHaveLength(4)
    expect(ruleCells(regions, 'touch', [1, 2], [0, 1])).toEqual([[1, 2], [0, 1]])
  })

  it('warns when a row, column or rug has no room left', () => {
    const regions = [
      [0, 0, 1, 1],
      [0, 2, 2, 1],
      [3, 2, 2, 1],
      [3, 3, 3, 3],
    ]
    expect(starved(regions, [])).toBeNull()
    // One pup never closes off this room: rug 2 still has (2, 1) free.
    expect(starved(regions, [[1, 3]])).toBeNull()
    // Pups at (0, 0) and (2, 3) leave row 1 with no free square.
    expect(starved(regions, [[0, 0], [2, 3]])?.kind).toBe('row')
    // The real answer never starves anything on the way.
    const p = makePuzzle(makeRng(11), 6)
    for (let k = 0; k <= 6; k++) expect(starved(p.regions, cellsOf(p.solution).slice(0, k))).toBeNull()
    expect(giftsFor(1)).toBe(1)
    expect(giftsFor(5)).toBe(0)
  })

  it('gives hints that fix a wrong pup first, then add a right one', () => {
    const p = makePuzzle(makeRng(3), 5)
    const wrongCol = (p.solution[0] + 2) % 5
    expect(hintFor(p, [[0, wrongCol]])).toEqual({ remove: [0, wrongCol] })
    expect(hintFor(p, [])).toEqual({ add: [0, p.solution[0]] })
    expect(hintFor(p, cellsOf(p.solution))).toBeNull()
  })

  it('scores clean rooms higher and keeps accuracy honest', () => {
    expect(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 2)).toBeGreaterThan(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 1))
    expect(pointsFor({ n: 6, mistakes: 0, hints: 0 }, 1)).toBeGreaterThan(pointsFor({ n: 6, mistakes: 1, hints: 0 }, 1))
    expect(pointsFor({ n: 4, mistakes: 40, hints: 4 }, 0)).toBe(20)
    expect(accuracyFor([{ n: 4, mistakes: 0, hints: 0 }])).toBe(1)
    expect(accuracyFor([{ n: 4, mistakes: 10, hints: 4 }])).toBe(0)
    expect(accuracyFor([])).toBe(0)
  })
})
