import { describe, expect, it } from 'vitest'
import { ROUNDS, dotChoices, dotCount, kmBetween, pickRound, placesFor, pointsForKm } from '../../kit/mapHunt'
import { makeRng } from '../../kit/random'
import { places } from './content'
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic'
import { HEIGHT, INSET, WIDTH } from './outline'

const find = (name: string) => places.en.find((p) => p.name === name)!

describe('UK map hunt', () => {
  it('puts every place inside the map', () => {
    for (const p of places.en) {
      const [x, y] = toMap(p.at)
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(WIDTH)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(HEIGHT)
    }
  })
  it('turns a tap back into the place, also in the Shetland box', () => {
    for (const p of places.en) {
      const [lon, lat] = fromMap(toMap(p.at))!
      expect(kmBetween([lon, lat], p.at)).toBeLessThan(1)
    }
    const [x, y] = toMap(find('Shetland').at)
    const [ix, iy, w, h] = INSET
    expect(x).toBeGreaterThan(ix)
    expect(x).toBeLessThan(ix + w)
    expect(y).toBeGreaterThan(iy)
    expect(y).toBeLessThan(iy + h)
  })
  it('knows real distances', () => {
    const km = kmBetween(find('London').at, find('Edinburgh').at)
    expect(km).toBeGreaterThan(520)
    expect(km).toBeLessThan(545)
  })
  it('asks ten different places per round at every level', () => {
    const rng = makeRng(2)
    for (let level = 1; level <= 10; level++) {
      const round = pickRound(rng, places.en, level)
      expect(round).toHaveLength(ROUNDS)
      expect(new Set(round).size).toBe(ROUNDS)
    }
  })
  it('offers the asked place among well spread dots', () => {
    const rng = makeRng(5)
    for (const level of [1, 2, 3]) {
      const pool = placesFor(places.en, level)
      for (const target of pool) {
        const dots = dotChoices(rng, pool, target, dotCount(level), DOT_GAP_KM)
        expect(dots[0]).toBe(target)
        expect(dots).toHaveLength(dotCount(level))
        for (let i = 0; i < dots.length; i++)
          for (let j = i + 1; j < dots.length; j++) expect(kmBetween(dots[i].at, dots[j].at)).toBeGreaterThan(DOT_GAP_KM)
      }
    }
  })
  it('scores closer taps higher', () => {
    expect(pointsForKm(10, BANDS)).toBe(30)
    expect(pointsForKm(40, BANDS)).toBe(20)
    expect(pointsForKm(80, BANDS)).toBe(10)
    expect(pointsForKm(300, BANDS)).toBe(0)
  })
})
