import { clamp, type Rng } from '../../kit/random'
import { groupsFor, type Group, type GroupId, type Word } from './content'

export const DURATION = 60
/** Words per set of baskets; then new baskets come in. */
export const SET_SIZE = 8

const lv = (level: number) => clamp(Math.round(level), 1, 10)
export const groupCount = (level: number) => (lv(level) <= 2 ? 2 : lv(level) <= 5 ? 3 : 4)
/** Pictures next to the words help early readers; from level 5 the word stands alone. */
export const showPictures = (level: number) => lv(level) <= 4
/** Seconds a word takes to ride the belt from right to left. */
export const beltSeconds = (level: number) => 7 - (lv(level) - 1) * 0.4

export interface Item {
  word: Word
  group: GroupId
  /** Counts the sets of baskets: when it changes, the baskets change. */
  set: number
}

/**
 * Deals words in sets: each set picks baskets (never the same baskets twice in a row), then deals
 * SET_SIZE words spread fairly over them. Words in a family come in a shuffled order and only come back once
 * the whole family has been used.
 */
export function makeDealer(rng: Rng, level: number, words: Record<GroupId, Word[]>) {
  const pool = groupsFor(level)
  const count = Math.min(groupCount(level), pool.length)
  const decks = new Map<GroupId, Word[]>()
  const draw = (g: GroupId) => {
    let deck = decks.get(g)
    if (!deck || deck.length === 0) {
      deck = rng.shuffle(words[g])
      decks.set(g, deck)
    }
    return deck.pop()!
  }
  let set = -1
  let baskets: Group[] = []
  let queue: Item[] = []
  const newSet = () => {
    const before = baskets.map((b) => b.id).sort().join()
    for (let i = 0; i < 20; i++) {
      baskets = rng.shuffle(pool).slice(0, count)
      if (baskets.map((b) => b.id).sort().join() !== before || pool.length === count) break
    }
    set++
    const ids = baskets.map((b) => b.id)
    const plan = Array.from({ length: SET_SIZE }, (_, i) => ids[i % ids.length])
    // Shuffle, but never three words in a row from one basket.
    let order = rng.shuffle(plan)
    for (let i = 0; i < 20 && order.some((g, k) => k >= 2 && g === order[k - 1] && g === order[k - 2]); i++) order = rng.shuffle(plan)
    queue = order.map((g) => ({ word: draw(g), group: g, set }))
  }
  return {
    next(): Item {
      if (queue.length === 0) newSet()
      return queue.shift()!
    },
    baskets: () => baskets,
  }
}

/** Streaks and quick answers earn more. `early` is how much of the belt was left (0 to 1). */
export const pointsFor = (combo: number, early: number) => 10 + Math.min(combo, 10) * 2 + Math.round(clamp(early, 0, 1) * 6)

export const accuracyFor = (right: number, wrong: number) =>
  clamp(right / Math.max(1, right + wrong), 0, 1) * clamp(right / 14, 0, 1)
