import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { angles, flipped, label, makeOptions, optionCount, pointsFor, randomTime, same, stepFor } from './logic'

describe('clock catch', () => {
  it('starts with whole hours', () => {
    const rng = makeRng(1)
    for (let i = 0; i < 100; i++) expect(randomTime(rng, stepFor(1)).m).toBe(0)
    expect(flipped(1, 1)).toBe(false)
    expect(flipped(3, 1)).toBe(true)
  })
  it('makes valid times at every level', () => {
    const rng = makeRng(2)
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 100; i++) {
        const t = randomTime(rng, stepFor(level))
        expect(t.h).toBeGreaterThanOrEqual(1)
        expect(t.h).toBeLessThanOrEqual(12)
        expect(t.m).toBeGreaterThanOrEqual(0)
        expect(t.m).toBeLessThan(60)
        expect(t.m % stepFor(level)).toBe(0)
      }
    }
  })
  it('offers distinct options including the answer', () => {
    const rng = makeRng(3)
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 100; i++) {
        const t = randomTime(rng, stepFor(level))
        const opts = makeOptions(rng, t, level)
        expect(opts).toHaveLength(optionCount(level))
        expect(opts.filter((o) => same(o, t))).toHaveLength(1)
        expect(new Set(opts.map(label)).size).toBe(opts.length)
        opts.forEach((o) => expect(o.m % stepFor(level)).toBe(0))
      }
    }
  })
  it('puts the hands in the right place', () => {
    expect(angles({ h: 3, m: 0 })).toEqual({ hour: 90, minute: 0 })
    expect(angles({ h: 12, m: 30 })).toEqual({ hour: 15, minute: 180 })
    expect(label({ h: 9, m: 5 })).toBe('9:05')
  })
  it('rewards speed and streaks', () => {
    expect(pointsFor(1, 0)).toBeGreaterThan(pointsFor(6, 0))
    expect(pointsFor(6, 3)).toBeGreaterThan(pointsFor(6, 0))
  })
})
