import { describe, expect, it } from 'vitest'
import { placesFor } from '../../kit/mapHunt'
import { places } from './content'

describe.each(Object.entries(places))('UK map places (%s)', (_, list) => {
  it('has at least 20 places at every level and 50 in total', () => {
    for (let level = 1; level <= 10; level++) expect(placesFor(list, level).length).toBeGreaterThanOrEqual(20)
    expect(list.length).toBeGreaterThanOrEqual(50)
  })
  it('swaps in harder places on higher levels', () => {
    expect(placesFor(list, 7).length - placesFor(list, 1).length).toBeGreaterThanOrEqual(30)
  })
  it('names every place once, NFC normalised', () => {
    expect(new Set(list.map((p) => p.name)).size).toBe(list.length)
    for (const p of list) expect(p.name).toBe(p.name.normalize('NFC'))
  })
  it('keeps every place inside the UK', () => {
    for (const { at: [lon, lat] } of list) {
      expect(lon).toBeGreaterThan(-8.2)
      expect(lon).toBeLessThan(1.8)
      expect(lat).toBeGreaterThan(49.9)
      expect(lat).toBeLessThan(60.9)
    }
  })
})

it('lists the same places in every language', () => {
  expect(places.hu.map((p) => p.at)).toEqual(places.en.map((p) => p.at))
})
