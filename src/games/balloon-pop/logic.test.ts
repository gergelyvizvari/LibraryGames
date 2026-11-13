import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { dealBoard, nextNumber, specFor } from './logic'

describe('balloon pop logic', () => {
  it('starts with three small numbers that stay until the first pop, and not the same three every time', () => {
    const rng = makeRng(1)
    const boards = Array.from({ length: 5 }, () => dealBoard(rng, 1).map((b) => b.n).sort().join())
    for (const b of boards) b.split(',').forEach((n) => expect(+n).toBeLessThanOrEqual(5))
    expect(new Set(boards).size).toBeGreaterThan(1)
    expect(specFor(1).show).toBeNull()
  })
  it('deals distinct numbers in range, in different spots and colours', () => {
    const rng = makeRng(4)
    for (let level = 1; level <= 10; level++) {
      const { count, max } = specFor(level)
      for (let i = 0; i < 30; i++) {
        const board = dealBoard(rng, level)
        expect(board).toHaveLength(count)
        expect(new Set(board.map((b) => b.n)).size).toBe(count)
        expect(new Set(board.map((b) => b.x)).size).toBe(count)
        expect(new Set(board.map((b) => b.color)).size).toBe(count)
        board.forEach((b) => {
          expect(b.n).toBeGreaterThanOrEqual(1)
          expect(b.n).toBeLessThanOrEqual(max)
        })
      }
    }
  })
  it('gets harder: more balloons and bigger numbers, and the numbers hide by themselves from level 3', () => {
    for (let level = 2; level <= 10; level++) {
      expect(specFor(level).count).toBeGreaterThanOrEqual(specFor(level - 1).count)
      expect(specFor(level).max).toBeGreaterThanOrEqual(specFor(level - 1).max)
    }
    expect(specFor(3).show).not.toBeNull()
    expect(specFor(10).count).toBe(6)
  })
  it('asks for the numbers from smallest to biggest', () => {
    const board = [
      { n: 7, x: 0, y: 0, color: 0 },
      { n: 2, x: 0, y: 0, color: 1 },
      { n: 11, x: 0, y: 0, color: 2 },
    ]
    expect([0, 1, 2].map((p) => nextNumber(board, p))).toEqual([2, 7, 11])
  })
})
