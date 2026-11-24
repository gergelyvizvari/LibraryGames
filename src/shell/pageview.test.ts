import { describe, expect, it } from 'vitest'
import { pagePath } from './pageview'

describe('pagePath', () => {
  it('counts the games list as the home page', () => {
    for (const h of ['', '#', '#/', '#/games', '#/games/']) expect(pagePath(h)).toBe('/')
  })
  it('keeps the game id so each game gets its own row', () => {
    expect(pagePath('#/play/makkbolt')).toBe('/play/makkbolt')
    expect(pagePath('#/daily/makkbolt')).toBe('/daily/makkbolt')
    expect(pagePath('#/map')).toBe('/map')
    expect(pagePath('#/stickers')).toBe('/stickers')
  })
  it('drops anything extra after the id', () => {
    expect(pagePath('#/play/makkbolt/x?y=1')).toBe('/play/makkbolt')
  })
})
