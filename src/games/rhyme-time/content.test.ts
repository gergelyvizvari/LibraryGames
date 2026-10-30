import { describe, expect, it } from 'vitest'
import { rhymes } from './content'

describe.each(Object.entries(rhymes))('rhyme time content (%s)', (_, groups) => {
  const all = groups.flatMap((g) => g.words)
  it('has at least 20 rhyme groups and 50 words', () => {
    expect(groups.length).toBeGreaterThanOrEqual(20)
    expect(all.length).toBeGreaterThanOrEqual(50)
  })
  it('uses every word and picture once', () => {
    expect(new Set(all.map((w) => w.word)).size).toBe(all.length)
    expect(new Set(all.map((w) => w.emoji)).size).toBe(all.length)
  })
  it('gives every group a partner and enough other sounds', () => {
    for (const g of groups) {
      expect(g.words.length).toBeGreaterThanOrEqual(2)
      expect(groups.filter((o) => o.sound !== g.sound).length).toBeGreaterThanOrEqual(3)
    }
  })
  it('keeps text NFC normalised', () => {
    for (const w of all) expect(w.word).toBe(w.word.normalize('NFC'))
  })
})
