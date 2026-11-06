import { describe, expect, it } from 'vitest'
import { pairs, poolFor } from './content'

describe.each(Object.entries(pairs))('opposites content (%s)', (_, list) => {
  const words = list.flatMap((q) => [q.a, q.b])
  it('has at least 20 pairs at every level, and 45 in total', () => {
    expect(list.length).toBeGreaterThanOrEqual(45)
    for (let level = 1; level <= 10; level++) expect(poolFor(list, level).length).toBeGreaterThanOrEqual(20)
  })
  it('swaps the easiest pairs out at the top levels', () => {
    const top = poolFor(list, 10)
    expect(poolFor(list, 1).some((q) => top.includes(q))).toBe(false)
  })
  it('uses every word and picture once', () => {
    expect(new Set(words.map((w) => w.word.toLowerCase())).size).toBe(words.length)
    const emojis = words.flatMap((w) => (w.emoji ? [w.emoji] : []))
    expect(new Set(emojis).size).toBe(emojis.length)
  })
  it('gives a picture to every pair that can show up with pictures on', () => {
    for (const q of list) if (q.minLevel < 6) expect(q.a.emoji && q.b.emoji).toBeTruthy()
  })
  it('keeps words short and NFC normalised', () => {
    for (const w of words) {
      expect(w.word).toBe(w.word.normalize('NFC'))
      expect(w.word.length).toBeLessThanOrEqual(12)
    }
  })
})

it('has the same amount of pairs per level in every language', () => {
  for (let level = 1; level <= 10; level++) expect(poolFor(pairs.hu, level).length).toBe(poolFor(pairs.en, level).length)
})
