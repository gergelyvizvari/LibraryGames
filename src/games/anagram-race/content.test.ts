import { describe, expect, it } from 'vitest'
import { words, wordsForLevel } from './content'

describe.each(Object.entries(words))('anagram race words (%s)', (_, list) => {
  it('uses every picture and word once', () => {
    expect(new Set(list.map((w) => w.emoji)).size).toBe(list.length)
    expect(new Set(list.map((w) => w.word)).size).toBe(list.length)
  })
  it('has at least 20 words for every level', () => {
    for (let level = 1; level <= 10; level++) expect(wordsForLevel(list, level).length).toBeGreaterThanOrEqual(20)
  })
  it('keeps level 1 to three-letter words', () => {
    wordsForLevel(list, 1).forEach((w) => expect(w.word).toHaveLength(3))
  })
})
