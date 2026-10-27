import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { countRange, makeDots, options, pointsFor } from './logic'

describe('how many', () => {
  it('places exactly n dots at every level', () => {
    const rng = makeRng(6)
    for (let level = 1; level <= 10; level++) {
      const [, max] = countRange(level)
      expect(makeDots(rng, max)).toHaveLength(max)
    }
  })
  it('offers four answers including the right one', () => {
    const rng = makeRng(1)
    for (let n = 3; n <= 25; n++) {
      const o = options(rng, n)
      expect(o).toHaveLength(4)
      expect(o).toContain(n)
    }
  })
  it('gives some points for being close', () => {
    expect(pointsFor(7, 7)).toBe(20)
    expect(pointsFor(6, 7)).toBe(5)
    expect(pointsFor(3, 7)).toBe(0)
  })
})
