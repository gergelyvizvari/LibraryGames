import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { makeVillage, neighbours, run, slotsFor, solve, stepsFor, type Village } from './logic'

// S . .
// # # .
// . . G   (S start, G goal, # pine)
const tiny: Village = {
  ground: ['path', 'path', 'path', 'grass', 'grass', 'pine', 'pine', 'path', 'grass', 'grass', 'grass', 'grass', 'path', 'grass', 'grass', ...Array(10).fill('grass')],
  start: 0,
  goal: 12,
  houses: [{ cell: 13, door: 12, roof: 0 }],
  shortest: 4,
}

describe('hedgehog post', () => {
  it('walks the cards and stops at the goal, a wall or the end of the cards', () => {
    expect(run(tiny, ['right', 'right', 'down', 'down']).outcome).toEqual({ kind: 'home', at: 3 })
    expect(run(tiny, ['down']).outcome).toEqual({ kind: 'blocked', at: 0 })
    expect(run(tiny, ['up']).outcome).toEqual({ kind: 'blocked', at: 0 })
    expect(run(tiny, ['right', 'right']).outcome).toEqual({ kind: 'short' })
    expect(run(tiny, ['right', 'right', 'down']).cells).toEqual([1, 2, 7])
    expect(solve(tiny)).toEqual(['right', 'right', 'down', 'down'])
  })

  it('builds villages whose shortest way is as long as the level asks', () => {
    for (let level = 1; level <= 10; level++) {
      for (let seed = 1; seed <= 15; seed++) {
        const v = makeVillage(makeRng(seed * 7 + level), level)
        const way = solve(v)
        expect(way).not.toBeNull()
        expect(way!.length).toBe(stepsFor(level))
        expect(v.shortest).toBe(stepsFor(level))
        expect(run(v, way!).outcome.kind).toBe('home')
        expect(slotsFor(v)).toBeGreaterThan(v.shortest)
        // The letter's house stands beside the goal, and no house sits on the path.
        expect(neighbours(v.goal)).toContain(v.houses[0].cell)
        v.houses.forEach((h) => expect(v.ground[h.cell]).not.toBe('path'))
        expect(new Set(v.houses.map((h) => h.cell)).size).toBe(v.houses.length)
      }
    }
  })
})
