import { beforeEach, describe, expect, it } from 'vitest'
import { awardSticker, stickerLevel, currentStreak, dailyDoneToday, gameProgress, isFavourite, loadProgress, nextLevel, recordRound, setLevel, stars, stickerCount, toggleFavourite } from './progress'

describe('progress', () => {
  beforeEach(() => localStorage.clear())

  it('adapts the level to how well the round went', () => {
    expect(nextLevel(3, 0.9)).toBe(4)
    expect(nextLevel(3, 0.6)).toBe(3)
    expect(nextLevel(3, 0.2)).toBe(2)
    expect(nextLevel(1, 0)).toBe(1)
    expect(nextLevel(10, 1)).toBe(10)
  })

  it('records best scores, records and XP', () => {
    const first = recordRound('demo', 'memory', { score: 50, accuracy: 0.9 })
    expect(first.newRecord).toBe(true)
    expect(first.level).toBe(2)
    const second = recordRound('demo', 'memory', { score: 30, accuracy: 0.5 })
    expect(second.newRecord).toBe(false)
    const p = loadProgress()
    expect(p.games.demo).toMatchObject({ best: 50, plays: 2, level: 2 })
    expect(p.xp.memory).toBeGreaterThan(0)
  })

  it('counts a streak over consecutive days', () => {
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, new Date(2026, 9, 1))
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, new Date(2026, 9, 2))
    expect(loadProgress().streak.days).toBe(2)
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, new Date(2026, 9, 5))
    expect(loadProgress().streak.days).toBe(1)
  })

  it('shows a streak only while it is alive', () => {
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, new Date(2026, 9, 1))
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, new Date(2026, 9, 2))
    const p = loadProgress()
    expect(currentStreak(p, new Date(2026, 9, 2))).toBe(2)
    expect(currentStreak(p, new Date(2026, 9, 3))).toBe(2)
    expect(currentStreak(p, new Date(2026, 9, 4))).toBe(0)
  })

  it('remembers the day the daily challenge was done', () => {
    const day = new Date(2026, 9, 7)
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, day)
    expect(dailyDoneToday(loadProgress(), day)).toBe(false)
    recordRound('demo', 'memory', { score: 1, accuracy: 0.5 }, day, true)
    expect(dailyDoneToday(loadProgress(), day)).toBe(true)
    expect(dailyDoneToday(loadProgress(), new Date(2026, 9, 8))).toBe(false)
  })

  it('gives up to three stars', () => {
    expect(stars(1)).toBe(3)
    expect(stars(0.7)).toBe(2)
    expect(stars(0)).toBe(0)
  })

  it('lets the player pick a level, kept between 1 and 10, and adapts from there', () => {
    localStorage.clear()
    setLevel('x', 7)
    expect(gameProgress(loadProgress(), 'x').level).toBe(7)
    setLevel('x', 99)
    expect(gameProgress(loadProgress(), 'x').level).toBe(10)
    setLevel('x', 0)
    expect(gameProgress(loadProgress(), 'x').level).toBe(1)
  })

  it('spreads stickers over the levels: the first at once, the last only at level 10', () => {
    expect([0, 1, 2, 3, 4].map((i) => stickerLevel(i, 5))).toEqual([1, 3, 6, 8, 10])
    expect(awardSticker('climb', 5, 1)).toBe(0)
    expect(awardSticker('climb', 5, 2)).toBeNull()
    expect(awardSticker('climb', 5, 3)).toBe(1)
    expect(awardSticker('climb', 5, 9)).toBe(2)
    expect(awardSticker('climb', 5, 9)).toBe(3)
    expect(awardSticker('climb', 5, 9)).toBeNull()
    expect(awardSticker('climb', 5, 10)).toBe(4)
  })

  it('hands out stickers one at a time until the album is full, and keeps them through later rounds', () => {
    expect(awardSticker('demo', 2)).toBe(0)
    recordRound('demo', 'memory', { score: 5, accuracy: 0.5 })
    expect(awardSticker('demo', 2)).toBe(1)
    expect(awardSticker('demo', 2)).toBeNull()
    expect(stickerCount(loadProgress(), 'demo')).toBe(2)
    expect(stickerCount(loadProgress(), 'other')).toBe(0)
  })

  it('gives a game a heart and takes it back, and remembers it', () => {
    expect(isFavourite(loadProgress(), 'a')).toBe(false)
    toggleFavourite('a')
    const p = toggleFavourite('b')
    expect(p.favourites?.map((f) => f.id)).toEqual(['a', 'b'])
    expect(isFavourite(loadProgress(), 'a')).toBe(true)
    toggleFavourite('a')
    expect(loadProgress().favourites?.map((f) => f.id)).toEqual(['b'])
  })
})
