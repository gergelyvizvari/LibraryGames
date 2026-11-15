import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { cloudCount, finish, finished, makeSky, moves, neighbours, planFor, refusal, stuck, trapCount, type Sky } from './logic'

// S 1 2
// 3 4 5
// . 7 8     (S start, . open sky)
const sky: Sky = {
  cols: 3,
  rows: 3,
  clouds: [true, true, true, true, true, true, false, true, true],
  start: 0,
  home: null,
  way: [0, 3, 4, 7, 8, 5, 2, 1],
}
// The same sky without cloud 7 and with the rainbow gate on cloud 8.
const gated: Sky = { ...sky, clouds: sky.clouds.map((c, i) => c && i !== 7), home: 8, way: [0, 3, 4, 1, 2, 5, 8] }

describe('pegasus post', () => {
  it('flies only to a neighbour it has not visited, and to the gate last', () => {
    expect(neighbours(sky, 4).sort()).toEqual([1, 3, 5, 7])
    expect(moves(sky, [0]).sort()).toEqual([1, 3])
    expect(refusal(sky, [0], 4)).toBe('far')
    expect(refusal(sky, [0, 1], 0)).toBe('visited')
    expect(refusal(sky, [0], 1)).toBeNull()
    expect(stuck(sky, [0, 1, 2, 5, 4, 3])).toBe(true)
    expect(stuck(sky, [0, 1, 2, 5, 4])).toBe(false)
    expect(finished(sky, sky.way)).toBe(true)
    expect(moves(gated, [0, 1, 2, 5])).toEqual([4])
    expect(refusal(gated, [0, 1, 2, 5], 8)).toBe('gate')
    expect(moves(gated, [0, 3, 4, 1, 2, 5])).toEqual([8])
  })

  it('knows whether a round can still be finished', () => {
    expect(finish(sky, [0])).toHaveLength(7)
    expect(finish(sky, [0, 1])).toEqual([2, 5, 8, 7, 4, 3])
    expect(finish(sky, [0, 1, 4])).toBeNull()
    expect(finish(gated, [0])).toEqual([3, 4, 1, 2, 5, 8])
    expect(finish(gated, [0, 1])).toBeNull()
    expect(trapCount(sky)).toBeGreaterThan(0)
  })

  it('builds skies that can be solved and hide enough wrong turns', () => {
    for (let level = 1; level <= 10; level++) {
      const plan = planFor(level)
      let traps = 0
      for (let seed = 1; seed <= 25; seed++) {
        const s = makeSky(makeRng(seed * 11 + level), level)
        expect(cloudCount(s)).toBe(plan.clouds)
        expect(s.way.length).toBe(plan.clouds)
        expect(s.way[0]).toBe(s.start)
        expect(new Set(s.way).size).toBe(plan.clouds)
        s.way.forEach((c, i) => i && expect(neighbours(s, s.way[i - 1])).toContain(c))
        expect(s.home).toBe(plan.home ? s.way[s.way.length - 1] : null)
        // Following the sky's own round is always allowed, step by step, to the very end.
        for (let i = 1; i < s.way.length; i++) expect(moves(s, s.way.slice(0, i))).toContain(s.way[i])
        expect(finished(s, s.way)).toBe(true)
        const rest = finish(s, [s.start])!
        expect(rest.length).toBe(plan.clouds - 1)
        traps += trapCount(s)
      }
      // On average a sky has at least as many wrong turns as its level asks for.
      expect(traps / 25).toBeGreaterThanOrEqual(plan.traps)
    }
  })
})
