import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { E, S, makeMaze, reachable, step } from './logic'

describe('maze dash', () => {
  it('every maze connects every cell', () => {
    const rng = makeRng(12)
    for (let n = 4; n <= 10; n++) {
      const m = makeMaze(rng, n, n + 1)
      expect(reachable(m)).toBe(n * (n + 1))
    }
  })
  it('walls block moves', () => {
    const m = { w: 2, h: 2, open: [E, 0, 0, 0] }
    expect(step(m, 0, E)).toBe(1)
    expect(step(m, 0, S)).toBe(0)
  })
})
