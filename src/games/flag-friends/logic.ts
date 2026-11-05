import { clamp, type Rng } from '../../kit/random'
import { countries, GROUPS, type Country, type Group } from './content'

/** One round lasts this long; boards keep coming until time is up. */
export const DURATION = 80

const lv = (level: number) => clamp(Math.round(level), 1, 10)

/** Flag + name pairs on a board: 3 at level 1, 6 at level 8 and up. */
export const pairCount = (level: number) => [3, 3, 4, 4, 4, 5, 5, 6, 6, 6][lv(level) - 1]

/** How long every card shows face up when a board starts, in ms. Gone from level 7. */
export const peekMs = (level: number) => (lv(level) <= 3 ? 2600 : lv(level) <= 6 ? 1400 : 0)

export const poolFor = (level: number, group: Group) => countries.filter((c) => c.group === group && c.minLevel <= lv(level))

/** Continents that have enough countries for a full board at this level. */
export const groupsFor = (level: number) => GROUPS.filter((g) => poolFor(level, g).length >= pairCount(level))

export interface Card {
  id: number
  iso: string
  kind: 'flag' | 'name'
  matched: boolean
}

/** A board for one continent: newer (harder) countries a bit more likely, so each level feels fresh. */
export function dealBoard(rng: Rng, level: number, group: Group): Card[] {
  const picked: Country[] = rng
    .shuffle(poolFor(level, group))
    .sort((a, b) => b.minLevel - a.minLevel + (rng.next() - 0.5) * 6)
    .slice(0, pairCount(level))
  const cards = picked.flatMap((c) => [
    { iso: c.iso, kind: 'flag' as const },
    { iso: c.iso, kind: 'name' as const },
  ])
  return rng.shuffle(cards).map((c, id) => ({ ...c, id, matched: false }))
}

/** The next continent: never the one just played, and every continent comes round before any repeats. */
export function nextGroup(rng: Rng, level: number, played: Group[]): Group {
  const all = groupsFor(level)
  const fresh = all.filter((g) => !played.includes(g))
  const options = (fresh.length ? fresh : all).filter((g) => g !== played.at(-1))
  return rng.pick(options.length ? options : all)
}

export const isPair = (a: Card, b: Card) => a.iso === b.iso && a.kind !== b.kind

/** Points for a pair: more with a streak of pairs found without a miss. */
export const pairPoints = (combo: number) => 10 + Math.min(Math.max(combo - 1, 0), 5) * 3
export const boardBonus = (pairs: number) => pairs * 4

/**
 * Accuracy for levelling up. A memory game always has some misses, so a good player finds a pair about
 * every second try; that counts as 1. A round with very few pairs counts less.
 */
export const accuracyFor = (pairs: number, tries: number) =>
  clamp((pairs * 2) / Math.max(1, tries), 0, 1) * clamp(pairs / 8, 0, 1)
