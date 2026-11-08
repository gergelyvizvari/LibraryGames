import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { groupsFor, words } from './content'
import { accuracyFor, beltSeconds, groupCount, makeDealer, pointsFor, SET_SIZE, showPictures } from './logic'

describe.each(Object.entries(words))('word families dealer (%s)', (_, lists) => {
  it('deals sets of words that belong to the shown baskets', () => {
    for (let level = 1; level <= 10; level++) {
      const deal = makeDealer(makeRng(level * 13), level, lists)
      let prevSet = ''
      for (let s = 0; s < 12; s++) {
        const items = Array.from({ length: SET_SIZE }, () => deal.next())
        const baskets = deal.baskets().map((b) => b.id)
        expect(baskets).toHaveLength(groupCount(level))
        for (const b of deal.baskets()) expect(groupsFor(level)).toContain(b)
        expect(new Set(items.map((i) => i.set)).size).toBe(1)
        for (const it of items) {
          expect(baskets).toContain(it.group)
          expect(lists[it.group]).toContain(it.word)
        }
        // Every basket gets words, and no basket gets three in a row.
        for (const b of baskets) expect(items.some((i) => i.group === b)).toBe(true)
        for (let k = 2; k < items.length; k++) expect(items[k].group === items[k - 1].group && items[k].group === items[k - 2].group).toBe(false)
        const key = [...baskets].sort().join()
        expect(key).not.toBe(prevSet)
        prevSet = key
      }
    }
  })
  it('uses a whole family before repeating a word', () => {
    const deal = makeDealer(makeRng(5), 1, lists)
    const seen = new Map<string, Set<string>>()
    for (let i = 0; i < 40; i++) {
      const it = deal.next()
      const s = seen.get(it.group) ?? new Set()
      if (s.size < lists[it.group].length) expect(s.has(it.word.word)).toBe(false)
      else s.clear()
      s.add(it.word.word)
      seen.set(it.group, s)
    }
  })
})

describe('word families rules', () => {
  it('starts easy and grows', () => {
    expect(groupCount(1)).toBe(2)
    expect(groupCount(10)).toBe(4)
    expect(showPictures(1)).toBe(true)
    expect(showPictures(5)).toBe(false)
    expect(beltSeconds(1)).toBeGreaterThan(beltSeconds(10))
    expect(beltSeconds(10)).toBeGreaterThan(3)
  })
  it('rewards streaks, speed and accuracy', () => {
    expect(pointsFor(6, 0)).toBeGreaterThan(pointsFor(1, 0))
    expect(pointsFor(1, 1)).toBeGreaterThan(pointsFor(1, 0))
    expect(accuracyFor(14, 0)).toBe(1)
    expect(accuracyFor(14, 4)).toBeLessThan(1)
    expect(accuracyFor(4, 0)).toBeLessThan(1)
  })
})
