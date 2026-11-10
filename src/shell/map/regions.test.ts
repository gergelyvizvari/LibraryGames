import { describe, expect, it } from 'vitest'
import { games } from '../../games/registry'
import { skills } from '../../kit/types'
import { MAP_H, MAP_W, mapScale, placeGames, regions } from './regions'

describe('map regions', () => {
  it('every skill belongs to exactly one region', () => {
    skills.forEach((s) => expect(regions.filter((r) => r.skills.includes(s)).map((r) => r.id), s).toHaveLength(1))
  })

  it('every game gets its own star on the map', () => {
    const placed = placeGames(games)
    expect(placed.map((p) => p.game.meta.id).sort()).toEqual(games.map((g) => g.meta.id).sort())
    expect(new Set(placed.map((p) => `${p.x},${p.y}`)).size).toBe(games.length)
  })

  it('keeps stars inside the picture and apart from each other', () => {
    const slots = regions.flatMap((r) => r.slots)
    slots.forEach(([x, y]) => {
      expect(x).toBeGreaterThan(20)
      expect(x).toBeLessThan(MAP_W - 20)
      expect(y).toBeGreaterThan(80)
      // The bottom strip stays free for today's adventure.
      expect(y).toBeLessThan(MAP_H - 100)
    })
    slots.forEach(([x, y], i) => slots.slice(i + 1).forEach(([a, b]) => expect(Math.hypot(x - a, y - b), `${x},${y} and ${a},${b}`).toBeGreaterThan(48)))
  })

  it('fits the height on a phone and the whole map on a wide screen', () => {
    expect(mapScale(390, 900)).toBe(1)
    const wide = mapScale(1920, 1080)
    expect(MAP_W * wide).toBeLessThanOrEqual(1920)
    expect(MAP_H * wide).toBeLessThanOrEqual(1080)
    // A phone on its side: stars stay big enough to tap, the map scrolls instead.
    expect(mapScale(844, 390)).toBe(0.7)
  })
})
