import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { dotChoices, dotCount, dotGapFor, kmBetween, pickRound, placesFor as poolFor, pointsForKm } from '../../kit/mapHunt'
import { features } from './content'
import { BANDS, DOT_GAP_KM, kindLabel, kmToFeature, kmToSegment, placesFor } from './logic'
import strings from './strings'

const byId = (id: string) => features.find((f) => f.id === id)!

describe('river & mountain hunt logic', () => {
  it('measures to the nearest bit of a river, not to its middle', () => {
    const danube = byId('danube')
    // Vienna and Belgrade are both on the Danube, far from its dot in Budapest.
    expect(kmToFeature(danube, [16.37, 48.2])).toBeLessThan(5)
    expect(kmToFeature(danube, [20.45, 44.8])).toBeLessThan(5)
    expect(kmBetween([16.37, 48.2], danube.at)).toBeGreaterThan(150)
    // Paris is far from the Danube.
    expect(kmToFeature(danube, [2.35, 48.85])).toBeGreaterThan(400)
  })

  it('scores a tap on Munich as close to the Alps, and London as off', () => {
    const alps = byId('alps')
    expect(pointsForKm(kmToFeature(alps, [11.58, 48.14]), BANDS)).toBeGreaterThanOrEqual(20)
    expect(pointsForKm(kmToFeature(alps, [-0.13, 51.51]), BANDS)).toBe(0)
  })

  it('uses the point for peaks and small seas', () => {
    expect(kmToFeature(byId('etna'), [15, 37.75])).toBeCloseTo(0)
    expect(kmToFeature(byId('kekes'), [19.05, 47.5])).toBeGreaterThan(50)
  })

  it('measures segments correctly', () => {
    expect(kmToSegment([0, 1], [-1, 0], [1, 0])).toBeCloseTo(110.57, 0)
    expect(kmToSegment([3, 0], [-1, 0], [1, 0])).toBeCloseTo(222.6, 0)
  })

  it('keeps every line near its own dot', () => {
    for (const f of features) expect(kmToFeature(f, f.at)).toBeLessThan(60)
  })

  it('plays ten different features and spreads the dots out', () => {
    for (let level = 1; level <= 10; level++) {
      const places = placesFor('en')
      const round = pickRound(makeRng(level), places, level)
      expect(new Set(round.map((p) => p.name)).size).toBe(10)
      if (level <= 3) {
        const dots = dotChoices(makeRng(level), poolFor(places, level), round[0], 6, DOT_GAP_KM)
        expect(dots.length).toBeGreaterThanOrEqual(5)
        for (let i = 0; i < dots.length; i++)
          for (let j = i + 1; j < dots.length; j++) expect(kmBetween(dots[i].at, dots[j].at)).toBeGreaterThan(DOT_GAP_KM)
      }
    }
  })

  it('names ranges, peaks, the ocean and the bay with their own word, in both languages', () => {
    expect(kindLabel(byId('alps'))).toBe('mountain')
    expect(kindLabel(byId('etna'))).toBe('peak')
    expect(kindLabel(byId('atlantic'))).toBe('ocean')
    expect(kindLabel(byId('biscay'))).toBe('bay')
    expect(strings.hu?.['kind.mountain']).toBe('Hegység')
    for (const f of features) for (const lang of ['en', 'hu'] as const) expect(strings[lang]?.[`kind.${kindLabel(f)}`]).toBeTruthy()
  })

  it('still finds a full set of well spread dots on the easy levels', () => {
    const places = placesFor('en')
    for (const level of [1, 2]) {
      for (let seed = 1; seed <= 30; seed++) {
        const rng = makeRng(seed)
        const pool = poolFor(places, level)
        const target = pool[seed % pool.length]
        const dots = dotChoices(rng, pool, target, dotCount(level), dotGapFor(level, DOT_GAP_KM))
        expect(dots.length).toBe(dotCount(level))
      }
    }
  })
})
