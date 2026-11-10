import { describe, expect, it } from 'vitest'
import { stories, storiesFor } from './content'

describe.each(Object.entries(stories))('story order content (%s)', (_, list) => {
  it('has at least 20 stories at every level', () => {
    for (let level = 1; level <= 10; level++) expect(storiesFor(list, level).length).toBeGreaterThanOrEqual(20)
  })
  it('keeps every story three or four short steps long, NFC normalised', () => {
    for (const story of list) {
      expect([3, 4]).toContain(story.steps.length)
      for (const step of story.steps) {
        expect(step.text).toBe(step.text.normalize('NFC'))
        expect(step.text.length).toBeLessThanOrEqual(36)
        expect(step.emoji).toBeTruthy()
      }
      // Two cards that look the same would make the order a guess.
      expect(new Set(story.steps.map((x) => x.emoji)).size).toBe(story.steps.length)
      expect(new Set(story.steps.map((x) => x.text)).size).toBe(story.steps.length)
    }
  })
  it('never repeats a story', () => {
    const keys = list.map((x) => x.steps.map((s) => s.text).join('|'))
    expect(new Set(keys).size).toBe(keys.length)
  })
})

it('has the same amount of stories per level in every language', () => {
  for (let level = 1; level <= 10; level++) expect(storiesFor(stories.hu, level).length).toBe(storiesFor(stories.en, level).length)
})
