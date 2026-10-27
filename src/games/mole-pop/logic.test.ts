import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { pickCritter, upTime } from './logic'

describe('mole pop', () => {
  it('has no bunnies at level 1', () => {
    const rng = makeRng(1)
    for (let i = 0; i < 300; i++) expect(pickCritter(rng, 1)).not.toBe('bunny')
  })
  it('gets quicker over time', () => {
    expect(upTime(1, 40)).toBeLessThan(upTime(1, 0))
  })
})
