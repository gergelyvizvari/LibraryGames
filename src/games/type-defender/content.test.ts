import { describe, expect, it } from 'vitest'
import { wordLists, wordsForLevel } from './content'

describe.each(Object.entries(wordLists))('type defender words (%s)', (_, list) => {
  it('has no duplicates and only lowercase letters', () => {
    expect(new Set(list).size).toBe(list.length)
    list.forEach((w) => expect(w).toMatch(/^\p{Ll}+$/u))
    list.forEach((w) => expect(w).toBe(w.normalize('NFC')))
  })
  it('has many words with many first letters at every level', () => {
    for (let level = 1; level <= 10; level++) {
      const pool = wordsForLevel(list, level)
      expect(pool.length).toBeGreaterThanOrEqual(50)
      expect(new Set(pool.map((w) => w[0])).size).toBeGreaterThanOrEqual(20)
    }
  })
})
