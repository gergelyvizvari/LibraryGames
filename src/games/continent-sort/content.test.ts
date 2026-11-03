import { describe, expect, it } from 'vitest'
import { continentNames, items, names } from './content'
import { CONTINENTS } from './continents'

describe('continent sort content', () => {
  it('has unique ids and pictures', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    expect(new Set(items.map((i) => i.emoji)).size).toBe(items.length)
    expect(items.length).toBeGreaterThanOrEqual(50)
  })

  describe.each(Object.entries(names))('%s', (_, list) => {
    it('names every item, with no extras or duplicates', () => {
      expect(Object.keys(list).sort()).toEqual(items.map((i) => i.id).sort())
      const values = Object.values(list)
      expect(new Set(values).size).toBe(values.length)
      values.forEach((v) => expect(v).toBe(v.normalize('NFC')))
    })
  })

  it.each(Object.entries(continentNames))('%s names every continent', (_, list) => {
    expect(Object.keys(list).sort()).toEqual([...CONTINENTS].sort())
  })
})
