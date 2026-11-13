import { describe, expect, it } from 'vitest'
import type { GameDef } from '../kit/types'
import { newGameIds, starRows } from './Home'

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
