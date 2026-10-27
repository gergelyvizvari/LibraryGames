import { clamp } from './random'
import type { RoundResult, Skill } from './types'

const KEY = 'lg.progress.v1'

export interface GameProgress {
  best: number
  plays: number
  level: number
  lastPlayed?: string
}

export interface Progress {
  games: Record<string, GameProgress>
  xp: Partial<Record<Skill, number>>
  streak: { days: number; lastDay?: string }
}

const empty = (): Progress => ({ games: {}, xp: {}, streak: { days: 0 } })

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage unavailable; progress lives only for this visit
  }
}

export function gameProgress(p: Progress, id: string): GameProgress {
  return p.games[id] ?? { best: 0, plays: 0, level: 1 }
}

/** Raise the level after a strong round, lower it after a weak one. */
export function nextLevel(level: number, accuracy: number) {
  if (accuracy >= 0.8) return clamp(level + 1, 1, 10)
  if (accuracy < 0.45) return clamp(level - 1, 1, 10)
  return level
}

export function isoDay(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function stars(accuracy: number) {
  return accuracy >= 0.85 ? 3 : accuracy >= 0.6 ? 2 : accuracy > 0.2 ? 1 : 0
}

export interface RecordOutcome {
  progress: Progress
  newRecord: boolean
  previousLevel: number
  level: number
  xpGained: number
}

export function recordRound(id: string, skill: Skill, result: RoundResult, today = new Date()): RecordOutcome {
  const p = loadProgress()
  const g = gameProgress(p, id)
  const day = isoDay(today)
  const newRecord = result.score > g.best && result.score > 0
  const level = nextLevel(g.level, result.accuracy)
  const xpGained = 10 + stars(result.accuracy) * 5

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  let streak = p.streak
  if (streak.lastDay !== day) {
    streak = { days: streak.lastDay === isoDay(yesterday) ? streak.days + 1 : 1, lastDay: day }
  }

  const progress: Progress = {
    games: { ...p.games, [id]: { best: Math.max(g.best, result.score), plays: g.plays + 1, level, lastPlayed: day } },
    xp: { ...p.xp, [skill]: (p.xp[skill] ?? 0) + xpGained },
    streak,
  }
  save(progress)
  return { progress, newRecord, previousLevel: g.level, level, xpGained }
}
