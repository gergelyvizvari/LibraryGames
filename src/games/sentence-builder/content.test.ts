import { describe, expect, it } from 'vitest'
import { sentences, sentencesForLevel } from './content'

describe.each(Object.entries(sentences))('sentence builder sentences (%s)', (_, list) => {
  it('has a different picture for every sentence', () => {
    expect(new Set(list.map((s) => s.picture)).size).toBe(list.length)
    expect(new Set(list.map((s) => s.text)).size).toBe(list.length)
  })
  it('has at least 15 sentences for every level, short ones first', () => {
    for (let level = 1; level <= 10; level++) expect(sentencesForLevel(list, level).length).toBeGreaterThanOrEqual(15)
    sentencesForLevel(list, 1).forEach((s) => expect(s.text.split(' ').length).toBeLessThanOrEqual(4))
  })
})
