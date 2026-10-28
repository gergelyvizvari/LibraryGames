import { describe, expect, it } from 'vitest'
import { sentences, sentencesForLevel } from './content'

describe('sentence builder sentences', () => {
  it('has a different picture for every sentence', () => {
    expect(new Set(sentences.en.map((s) => s.picture)).size).toBe(sentences.en.length)
    expect(new Set(sentences.en.map((s) => s.text)).size).toBe(sentences.en.length)
  })
  it('has at least 15 sentences for every level, short ones first', () => {
    for (let level = 1; level <= 10; level++) expect(sentencesForLevel(sentences.en, level).length).toBeGreaterThanOrEqual(15)
    sentencesForLevel(sentences.en, 1).forEach((s) => expect(s.text.split(' ').length).toBeLessThanOrEqual(4))
  })
})
