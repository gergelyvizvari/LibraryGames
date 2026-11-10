import { afterEach, describe, expect, it, vi } from 'vitest'
import { shownGames } from '../games/registry'
import { touchOnly } from './device'
import type { GameDef } from './types'

const game = (id: string, keyboard?: boolean) => ({ meta: { id, keyboard } }) as GameDef

describe('games that need a keyboard', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('are hidden on a touch screen only', () => {
    const list = [game('a'), game('typing', true), game('b')]
    expect(shownGames(list, true).map((g) => g.meta.id)).toEqual(['a', 'b'])
    expect(shownGames(list, false)).toHaveLength(3)
  })

  it('tells a phone from a computer by its pointer', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('coarse') }))
    expect(touchOnly()).toBe(true)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    expect(touchOnly()).toBe(false)
  })
})
