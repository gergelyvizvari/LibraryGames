import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { grade, hitsFor, makePattern, rhythmScore } from './logic'

describe('rhythm copy', () => {
  it('makes patterns with the right number of rising hit times', () => {
    const rng = makeRng(3)
    for (let level = 1; level <= 10; level++) {
      const p = makePattern(rng, level, 0)
      expect(p).toHaveLength(hitsFor(level, 0))
      p.slice(1).forEach((t, i) => expect(t).toBeGreaterThan(p[i]))
    }
  })
  it('scores an exact copy as perfect, even if it starts late', () => {
    const p = [0, 600, 900, 1500]
    expect(rhythmScore(p, p.map((t) => t + 400))).toBe(1)
  })
  it('scores a sloppy copy lower and a wrong count as zero', () => {
    const p = [0, 600, 900, 1500]
    expect(rhythmScore(p, [0, 300, 900, 1200])).toBeLessThan(0.5)
    expect(rhythmScore(p, [0, 600, 900])).toBe(0)
  })
  it('grades scores', () => {
    expect(grade(1)).toBe('perfect')
    expect(grade(0.1)).toBe('oops')
  })
})
