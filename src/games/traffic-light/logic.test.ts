import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { nextLight, progress, specFor, tapOn, type Light } from './logic'

describe('traffic light', () => {
  it('only hops on green', () => {
    expect(tapOn('green')).toBe('hop')
    expect(tapOn('red')).toBe('wait')
    expect(tapOn('yellow')).toBe('wait')
  })

  it('cycles red, green, (yellow), red with times from the level', () => {
    const rng = makeRng(5)
    for (let level = 1; level <= 10; level++) {
      const spec = specFor(level)
      let light: Light = 'red'
      const seen: Light[] = []
      for (let i = 0; i < 30; i++) {
        const next = nextLight(rng, spec, light)
        if (next.light === 'red') expect(next.ms >= spec.redMin && next.ms <= spec.redMax).toBe(true)
        if (next.light === 'green') expect(next.ms).toBe(spec.green)
        seen.push(next.light)
        light = next.light
      }
      expect(seen.includes('yellow')).toBe(spec.yellow > 0)
      expect(seen.includes('green')).toBe(true)
    }
  })

  it('starts easy and gets quicker', () => {
    expect(specFor(1).yellow).toBe(0)
    expect(specFor(1).green).toBeGreaterThan(specFor(10).green)
    expect(specFor(10).steps).toBeGreaterThan(specFor(1).steps)
    expect(specFor(99)).toEqual(specFor(10))
  })

  it('moves the hedgehog from kerb to kerb', () => {
    expect(progress(0, 4)).toBe(0)
    expect(progress(2, 4)).toBe(0.5)
    expect(progress(5, 4)).toBe(1)
  })
})
