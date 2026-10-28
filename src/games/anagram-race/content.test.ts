import { describe, expect, it } from 'vitest'
import { words, wordsForLevel } from './content'

describe('anagram race words', () => {
  it('uses every picture and word once', () => {
    expect(new Set(words.en.map((w) => w.emoji)).size).toBe(words.en.length)
    expect(new Set(words.en.map((w) => w.word)).size).toBe(words.en.length)
  })
  it('has at least 20 words for every level', () => {
    for (let level = 1; level <= 10; level++) expect(wordsForLevel(words.en, level).length).toBeGreaterThanOrEqual(20)
  })
  it('keeps level 1 to three-letter words', () => {
    wordsForLevel(words.en, 1).forEach((w) => expect(w.word).toHaveLength(3))
  })
})
