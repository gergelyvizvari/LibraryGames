import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { makePuzzle } from './logic'

describe('what comes next', () => {
  it('always offers the right answer once among three options', () => {
    const rng = makeRng(5)
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 50; i++) {
        const p = makePuzzle(rng, level)
        expect(p.options).toHaveLength(3)
        expect(p.options.filter((o) => o === p.answer)).toHaveLength(1)
        expect(p.shown.length).toBeGreaterThanOrEqual(4)
      }
    }
  })
})
