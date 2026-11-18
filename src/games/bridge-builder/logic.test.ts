import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { DECK_LEFT, DECK_RIGHT, fit, makeTask, MAX_PLANK, MIN_PLANK, specFor } from './logic'

describe('bridge builder', () => {
  it('has exactly one plank that fits, and the others differ by at least one step', () => {
    for (let level = 1; level <= 10; level++) {
      const rng = makeRng(level * 31)
      const spec = specFor(level)
      let last = 0
      for (let i = 0; i < 300; i++) {
        const task = makeTask(rng, level, last)
        expect(task.planks).toHaveLength(spec.choices)
        expect(task.planks[task.fits].length).toBe(task.gap)
        expect(task.planks.filter((p) => fit(p.length, task.gap) === 'exact')).toHaveLength(1)
        task.planks.forEach((p) => {
          expect(p.length).toBeGreaterThanOrEqual(MIN_PLANK)
          expect(p.length).toBeLessThanOrEqual(MAX_PLANK)
          if (p.length !== task.gap) expect(Math.abs(p.length - task.gap)).toBeGreaterThanOrEqual(task.gap * spec.diff - 1)
          expect(p.x + p.length).toBeLessThanOrEqual(400)
          expect(Math.abs(p.tilt)).toBeLessThanOrEqual(spec.tilt)
        })
        expect(task.gapAt).toBeGreaterThan(DECK_LEFT)
        expect(task.gapAt + task.gap).toBeLessThan(DECK_RIGHT)
        last = task.gap
      }
    }
  })

  it('makes later levels harder', () => {
    expect(specFor(10).diff).toBeLessThan(specFor(1).diff)
    expect(specFor(10).choices).toBeGreaterThan(specFor(1).choices)
    expect(specFor(1).tilt).toBe(0)
  })

  it('never asks to tell apart planks closer than 15% of the gap', () => {
    for (let level = 1; level <= 10; level++) expect(specFor(level).diff).toBeGreaterThanOrEqual(0.15)
  })

  it('tells short, exact and long apart', () => {
    expect(fit(80, 100)).toBe('short')
    expect(fit(100, 100)).toBe('exact')
    expect(fit(120, 100)).toBe('long')
  })
})
