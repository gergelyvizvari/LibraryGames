import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { makePuzzle, mirror, sameShape, shapes } from './logic'

describe('shape spin', () => {
  it('every shape is different from its mirror image', () => {
    shapes.forEach((s) => expect(sameShape(s, mirror(s))).toBe(false))
  })
  it('exactly one option is the target turned', () => {
    const rng = makeRng(11)
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 50; i++) {
        const p = makePuzzle(rng, level)
        const matches = p.options.filter((o) => sameShape(p.target, o))
        expect(matches).toHaveLength(1)
        expect(sameShape(p.target, p.options[p.answer])).toBe(true)
      }
    }
  })
})
