import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { makeBridge, planFor, RAINBOW, solutions, wrongPlaces, type Bridge } from './logic'

describe('rainbow bridge', () => {
  it('finds the stones that are in the wrong place', () => {
    const b: Bridge = { answer: ['yellow', 'green', 'blue'], fixed: [true, false, false], tray: ['blue', 'pink', 'green'], reversed: false }
    expect(wrongPlaces(b, ['yellow', 'green', 'blue'])).toEqual([])
    expect(wrongPlaces(b, ['yellow', 'blue', 'green'])).toEqual([1, 2])
    expect(wrongPlaces(b, ['yellow', 'green', 'pink'])).toEqual([2])
    expect(wrongPlaces(b, ['yellow', 'green', null])).toEqual([2])
    expect(solutions(b)).toEqual([['yellow', 'green', 'blue']])
  })

  it('builds bridges that follow the rainbow and can be finished in exactly one way', () => {
    let reversed = 0
    for (let level = 1; level <= 10; level++) {
      const plan = planFor(level)
      for (let seed = 1; seed <= 60; seed++) {
        const b = makeBridge(makeRng(seed * 13 + level), level)
        const run = b.reversed ? [...b.answer].reverse() : b.answer
        const first = RAINBOW.indexOf(run[0])
        expect(run).toEqual(RAINBOW.slice(first, first + plan.len))
        expect(b.fixed.filter((f) => !f).length).toBe(plan.gaps)
        expect(b.tray.length).toBe(plan.gaps + plan.traps)
        expect(solutions(b)).toEqual([b.answer])
        if (!plan.canReverse) expect(b.reversed).toBe(false)
        if (b.reversed) reversed++
      }
    }
    expect(reversed).toBeGreaterThan(60)
  })

  it('starts easy: the first level shows the rainbow and never turns the bridge round', () => {
    expect(planFor(1)).toMatchObject({ gaps: 3, help: 'shown', canReverse: false })
    expect(planFor(10).help).toBe('none')
  })
})
