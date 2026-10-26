import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { boardSizes, deal } from './logic'

describe('pair rush deal', () => {
  it('deals every face exactly twice', () => {
    for (const size of boardSizes) {
      const cards = deal(makeRng(size), size)
      expect(cards).toHaveLength(size)
      const counts = new Map<string, number>()
      cards.forEach((c) => counts.set(c.face, (counts.get(c.face) ?? 0) + 1))
      expect([...counts.values()].every((n) => n === 2)).toBe(true)
    }
  })
})
