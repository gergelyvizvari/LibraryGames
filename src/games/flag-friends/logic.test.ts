import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { countries, GROUPS } from './content'
import { accuracyFor, boardBonus, dealBoard, groupsFor, isPair, nextGroup, pairCount, pairPoints, peekMs, poolFor } from './logic'

describe('flag friends logic', () => {
  it('starts easy and gets harder', () => {
    expect(pairCount(1)).toBe(3)
    expect(pairCount(10)).toBe(6)
    expect(peekMs(1)).toBeGreaterThan(peekMs(5))
    expect(peekMs(8)).toBe(0)
  })

  it('has at least three continents to play at every level', () => {
    for (let l = 1; l <= 10; l++) expect(groupsFor(l).length).toBeGreaterThanOrEqual(3)
    expect(groupsFor(1)).toEqual([...GROUPS])
  })

  it('deals a flag and a name for each country of one continent', () => {
    for (let s = 1; s <= 30; s++) {
      const level = (s % 10) + 1
      const group = groupsFor(level)[s % groupsFor(level).length]
      const cards = dealBoard(makeRng(s), level, group)
      expect(cards).toHaveLength(pairCount(level) * 2)
      const isos = new Set(cards.map((c) => c.iso))
      expect(isos.size).toBe(pairCount(level))
      for (const iso of isos) {
        expect(cards.filter((c) => c.iso === iso).map((c) => c.kind).sort()).toEqual(['flag', 'name'])
        expect(countries.find((c) => c.iso === iso)!.group).toBe(group)
      }
      cards.forEach((c) => expect(poolFor(level, group).some((p) => p.iso === c.iso)).toBe(true))
    }
  })

  it('matches a flag with its own name only', () => {
    const flag = { id: 0, iso: 'HU', kind: 'flag' as const, matched: false }
    expect(isPair(flag, { ...flag, id: 1, kind: 'name' })).toBe(true)
    expect(isPair(flag, { ...flag, id: 1 })).toBe(false)
    expect(isPair(flag, { ...flag, id: 1, iso: 'FR', kind: 'name' })).toBe(false)
  })

  it('goes round the continents before repeating one', () => {
    const rng = makeRng(3)
    const played = [nextGroup(rng, 1, [])]
    while (played.length < 6) played.push(nextGroup(rng, 1, played))
    expect(new Set(played).size).toBe(6)
    const seventh = nextGroup(rng, 1, played)
    expect(seventh).not.toBe(played.at(-1))
  })

  it('scores streaks, cleared boards and honest accuracy', () => {
    expect(pairPoints(1)).toBe(10)
    expect(pairPoints(4)).toBeGreaterThan(pairPoints(2))
    expect(pairPoints(99)).toBe(pairPoints(6))
    expect(boardBonus(6)).toBeGreaterThan(boardBonus(3))
    expect(accuracyFor(10, 20)).toBe(1)
    expect(accuracyFor(10, 40)).toBe(0.5)
    expect(accuracyFor(2, 4)).toBeLessThan(0.5)
    expect(accuracyFor(0, 0)).toBe(0)
  })
})
