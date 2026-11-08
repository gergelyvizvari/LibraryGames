import { describe, expect, it } from 'vitest'
import { GROUPS, groupsFor, words } from './content'
import { groupCount } from './logic'
import strings from './strings'

describe.each(Object.entries(words))('word families content (%s)', (locale, lists) => {
  const all = GROUPS.flatMap((g) => lists[g.id])
  it('has at least 10 words in every family and 120 in total', () => {
    for (const g of GROUPS) expect(lists[g.id].length).toBeGreaterThanOrEqual(10)
    expect(all.length).toBeGreaterThanOrEqual(120)
  })
  it('has at least 20 words and enough baskets at every level', () => {
    for (let level = 1; level <= 10; level++) {
      const groups = groupsFor(level)
      expect(groups.length).toBeGreaterThan(groupCount(level))
      expect(groups.reduce((n, g) => n + lists[g.id].length, 0)).toBeGreaterThanOrEqual(20)
    }
  })
  it('swaps the easiest families out at the top levels', () => {
    const top = groupsFor(10)
    expect(groupsFor(1).some((g) => top.includes(g))).toBe(false)
  })
  it('uses every word and picture once', () => {
    expect(new Set(all.map((x) => x.word.toLowerCase())).size).toBe(all.length)
    expect(new Set(all.map((x) => x.emoji)).size).toBe(all.length)
  })
  it('keeps words short and NFC normalised', () => {
    for (const x of all) {
      expect(x.word).toBe(x.word.normalize('NFC'))
      expect(x.word.length).toBeLessThanOrEqual(14)
    }
  })
  it('names every basket', () => {
    const dict = strings[locale as keyof typeof strings]!
    for (const g of GROUPS) expect(dict[`group.${g.id}`]).toBeTruthy()
  })
})

it('has the same amount of words per family in every language (within one)', () => {
  for (const g of GROUPS) expect(Math.abs(words.hu[g.id].length - words.en[g.id].length)).toBeLessThanOrEqual(1)
})
