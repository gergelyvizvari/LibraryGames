import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { countWays, guestsFor, isSet, makeTable, wishState, type Table } from './logic'

const table: Table = {
  guests: ['owl', 'bunny', 'bear', 'hedgehog'],
  cake: 2,
  wishes: [{ kind: 'window' }, { kind: 'next', who: 2 }, { kind: 'cake' }, { kind: 'apart', who: 0 }],
}

describe('forest feast', () => {
  it('reads each wish', () => {
    expect(wishState(table, [0, 3, 2, 1], 0)).toBe('ok')
    expect(wishState(table, [0, 3, 2, 1], 3)).toBe('broken')
    expect(wishState(table, [0, 1, 2, 3], 3)).toBe('ok')
    expect(wishState(table, [null, 0, 2, null], 0)).toBe('broken')
    // The friend is not seated yet but a chair next to the bunny is free.
    expect(wishState(table, [null, 1, null, null], 1)).toBe('open')
    expect(wishState(table, [0, 1, 3, null], 1)).toBe('broken')
  })

  it('knows a set table', () => {
    expect(isSet(table, [0, 1, 2, 3])).toBe(true)
    expect(isSet(table, [0, 3, 2, 1])).toBe(false)
    expect(isSet(table, [0, 1, 2, null])).toBe(false)
    expect(countWays(table)).toBe(1)
  })

  it('makes tables with exactly one way to seat everyone, at every level', () => {
    for (let level = 1; level <= 10; level++) {
      for (let seed = 1; seed <= 12; seed++) {
        const t = makeTable(makeRng(seed * 31 + level), level)
        expect(t.guests).toHaveLength(guestsFor(level))
        expect(new Set(t.guests).size).toBe(t.guests.length)
        expect(t.guests).not.toContain('fox')
        expect(t.cake).toBeGreaterThan(0)
        expect(countWays(t)).toBe(1)
        if (level < 3) expect(t.wishes.some((w) => w?.kind === 'apart')).toBe(false)
      }
    }
  })
})
