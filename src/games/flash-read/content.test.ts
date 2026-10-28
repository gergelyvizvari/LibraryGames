import { describe, expect, it } from 'vitest'
import { stories, storiesForLevel } from './content'

describe('flash read stories', () => {
  it('every story has three different options and a question', () => {
    stories.en.forEach((s) => {
      expect(new Set(s.options).size).toBe(3)
      expect(s.question.endsWith('?')).toBe(true)
    })
    expect(new Set(stories.en.map((s) => s.text)).size).toBe(stories.en.length)
  })
  it('has plenty of stories at every level, and the easiest at level 1', () => {
    for (let level = 1; level <= 10; level++) expect(storiesForLevel(stories.en, level).length).toBeGreaterThanOrEqual(15)
    storiesForLevel(stories.en, 1).forEach((s) => expect(s.tier).toBe(1))
  })
})
