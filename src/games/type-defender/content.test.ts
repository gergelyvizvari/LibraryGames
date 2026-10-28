import { describe, expect, it } from 'vitest'
import { wordLists, wordsForLevel } from './content'

describe('type defender words', () => {
  it('has no duplicates and only plain lowercase letters', () => {
    expect(new Set(wordLists.en).size).toBe(wordLists.en.length)
    wordLists.en.forEach((w) => expect(w).toMatch(/^[a-z]+$/))
  })
  it('has many words with many first letters at every level', () => {
    for (let level = 1; level <= 10; level++) {
      const pool = wordsForLevel(wordLists.en, level)
      expect(pool.length).toBeGreaterThanOrEqual(50)
      expect(new Set(pool.map((w) => w[0])).size).toBeGreaterThanOrEqual(20)
    }
  })
})
