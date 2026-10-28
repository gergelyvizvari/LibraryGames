import { describe, expect, it } from 'vitest'
import { stories, storiesForLevel } from './content'

describe.each(Object.entries(stories))('flash read stories (%s)', (_, list) => {
  it('every story has three different options and a question', () => {
    list.forEach((s) => {
      expect(new Set(s.options).size).toBe(3)
      expect(s.question.endsWith('?')).toBe(true)
    })
    expect(new Set(list.map((s) => s.text)).size).toBe(list.length)
  })
  it('has plenty of stories at every level, and the easiest at level 1', () => {
    for (let level = 1; level <= 10; level++) expect(storiesForLevel(list, level).length).toBeGreaterThanOrEqual(15)
    storiesForLevel(list, 1).forEach((s) => expect(s.tier).toBe(1))
  })
})
