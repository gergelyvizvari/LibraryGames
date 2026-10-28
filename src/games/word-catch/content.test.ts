import { describe, expect, it } from 'vitest'
import { words, wordsForLevel } from './content'

describe('word catch words', () => {
  it('uses every picture and word once', () => {
    expect(new Set(words.en.map((w) => w.emoji)).size).toBe(words.en.length)
    expect(new Set(words.en.map((w) => w.word)).size).toBe(words.en.length)
  })
  it('has at least 40 words for every level', () => {
    for (let level = 1; level <= 10; level++) expect(wordsForLevel(words.en, level).length).toBeGreaterThanOrEqual(40)
  })
})
