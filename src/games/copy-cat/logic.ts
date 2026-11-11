import { clamp, type Rng } from '../../kit/random'
import { linesFor, type Line } from './content'

/** Lines to copy in one stage. */
export const STAGE = 5

/** Up to this level a letter also counts typed without its accent (cel for cél), as ő and ű are hard on many keyboards. */
export const ACCENT_FREE_UP_TO = 4

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC')

/** Whether the key the child pressed is the letter (or space) the line wants next. Capitals never matter. */
export function keyMatches(want: string, key: string, level: number) {
  if (key.length !== 1 && key.normalize('NFC').length !== 1) return false
  const a = want.toLowerCase()
  const b = key.normalize('NFC').toLowerCase()
  if (a === b) return true
  return clamp(Math.round(level), 1, 10) <= ACCENT_FREE_UP_TO && fold(a) === fold(b)
}

/** Whether a key is something a child typed on purpose: a letter or the space bar, not Shift, an arrow or a shortcut. */
export const isTypingKey = (key: string) => key === ' ' || /^\p{L}$/u.test(key.normalize('NFC'))

/** The words of a line with where each starts, so the note can keep a word on one row. */
export function wordsOf(text: string) {
  let at = 0
  return text.split(' ').map((word) => {
    const start = at
    at += word.length + 1
    return { word, start }
  })
}

/** Deals lines for the level in a shuffled order; none comes back until the whole pool has been used. */
export function makeDealer(rng: Rng, list: Line[], level: number) {
  const pool = linesFor(list, level)
  let deck: Line[] = []
  let last: Line | null = null
  return (): Line => {
    if (deck.length === 0) {
      deck = rng.shuffle(pool)
      // The last line of one round never opens the next.
      if (deck.length > 1 && deck[deck.length - 1] === last) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]]
    }
    last = deck.pop()!
    return last
  }
}
