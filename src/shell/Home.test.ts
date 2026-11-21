import { describe, expect, it } from 'vitest'
import type { GameDef } from '../kit/types'
import type { Progress } from '../kit/progress'
import { newGameIds, recentGames, starRows } from './Home'

const game = (id: string, added: string) => ({ meta: { id, added } }) as GameDef

describe('newGameIds', () => {
  const today = new Date('2026-10-28')

  it('labels at most three of the newest games', () => {
    const list = [game('a', '2026-10-26'), game('b', '2026-10-27'), game('c', '2026-10-27'), game('d', '2026-10-25'), game('e', '2026-10-27')]
    expect([...newGameIds(list, today)]).toEqual(['e', 'c', 'b'])
  })

  it('skips games older than a week', () => {
    expect(newGameIds([game('old', '2026-10-01')], today).size).toBe(0)
  })
})

describe('starRows', () => {
  it('keeps five or fewer stars on one row', () => {
    expect(starRows(5)).toEqual([[0, 1, 2, 3, 4]])
    expect(starRows(3)).toEqual([[0, 1, 2]])
  })

  it('splits more stars into even rows of at most five', () => {
    expect(starRows(10).map((r) => r.length)).toEqual([5, 5])
    expect(starRows(7).map((r) => r.length)).toEqual([4, 3])
    expect(starRows(12).map((r) => r.length)).toEqual([4, 4, 4])
    expect(starRows(10).flat()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})

describe('recentGames', () => {
  const list = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => game(id, '2026-10-01'))
  const played = (lastPlayed: string, plays: number) => ({ best: 0, plays, level: 1, lastPlayed })
  const progress = {
    games: { a: played('2026-11-01', 1), b: played('2026-11-03', 1), c: played('2026-11-03', 5), e: played('2026-11-02', 2), f: played('2026-10-01', 1) },
    xp: {},
    streak: { days: 0 },
  } as Progress

  it('lists the games played lately, newest day first, then the most played', () => {
    expect(recentGames(list, progress).map((g) => g.meta.id)).toEqual(['c', 'b', 'e', 'a'])
  })

  it('leaves out games never played', () => {
    expect(recentGames(list, { games: {}, xp: {}, streak: { days: 0 } } as Progress)).toEqual([])
  })
})
