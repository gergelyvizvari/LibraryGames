import { beforeEach, describe, expect, it } from 'vitest'
import { currentStreak, dailyDoneToday, loadProgress, nextLevel, recordRound, stars } from './progress'

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
})
