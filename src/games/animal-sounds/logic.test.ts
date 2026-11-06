import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { ANIMALS, ROUNDS, animalCount, makeSequence, roundPoints, seqLength, showLights } from './logic'

describe('animal sounds', () => {
  it('starts small and easy', () => {
    expect(animalCount(1)).toBe(6)
    expect(animalCount(8)).toBe(9)
    expect(seqLength(1, 0)).toBe(3)
    expect(showLights(1)).toBe(true)
    expect(showLights(8)).toBe(false)
  })
  it('never asks for more animals than exist', () => {
    for (let level = 1; level <= 10; level++) {
      expect(animalCount(level)).toBeLessThanOrEqual(ANIMALS.length)
      for (let r = 0; r < ROUNDS; r++) expect(seqLength(level, r)).toBeLessThanOrEqual(8)
    }
  })
  it('makes sequences with no triple repeats', () => {
    const rng = makeRng(5)
    for (let i = 0; i < 200; i++) {
      const s = makeSequence(rng, 7, 3)
      expect(s).toHaveLength(7)
      s.forEach((a) => expect(a).toBeLessThan(3))
      for (let j = 2; j < s.length; j++) expect(s[j] === s[j - 1] && s[j] === s[j - 2]).toBe(false)
    }
  })
  it('rewards not replaying', () => {
    expect(roundPoints(4, false, 0)).toBeGreaterThan(roundPoints(4, true, 0))
  })
})
