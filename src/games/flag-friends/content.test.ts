import { describe, expect, it } from 'vitest'
import { countries, flag, GROUPS, names } from './content'

describe('flag friends content', () => {
  it('has plenty of unique countries, on every continent', () => {
    expect(new Set(countries.map((c) => c.iso)).size).toBe(countries.length)
    expect(countries.length).toBeGreaterThanOrEqual(50)
    for (let l = 1; l <= 10; l++) expect(countries.filter((c) => c.minLevel <= l).length).toBeGreaterThanOrEqual(20)
    for (const g of GROUPS) expect(countries.filter((c) => c.group === g && c.minLevel === 1).length).toBeGreaterThanOrEqual(3)
    countries.forEach((c) => expect(c.iso).toMatch(/^[A-Z]{2}$/))
  })

  it('builds flag emoji from the code', () => {
    expect(flag('HU')).toBe('🇭🇺')
  })

  describe.each(Object.entries(names))('%s', (_, list) => {
    it('names every country once, short enough for a card', () => {
      expect(Object.keys(list).sort()).toEqual(countries.map((c) => c.iso).sort())
      const values = Object.values(list)
      expect(new Set(values).size).toBe(values.length)
      values.forEach((v) => {
        expect(v).toBe(v.normalize('NFC'))
        expect(v.length).toBeLessThanOrEqual(20)
      })
    })
  })
})
