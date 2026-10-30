import { clamp, type Rng } from '../../kit/random'
import type { RhymeGroup, Word } from './content'

export const DURATION = 60

export const optionCount = (level: number) => (level <= 3 ? 3 : 4)
/** From level 6 the answers are words only, so kids read them. */
export const showPictures = (level: number) => level < 6

export interface Question {
  target: Word
  answer: Word
  options: Word[]
}

/** Deals groups in a shuffled order, reshuffling when the deck runs out, so no group repeats soon. */
export function makeDealer(rng: Rng, groups: RhymeGroup[]) {
  let deck: number[] = []
  let last = -1
  return () => {
    if (deck.length === 0) {
      deck = rng.shuffle(groups.map((_, i) => i))
      if (deck[deck.length - 1] === last && deck.length > 1) deck.unshift(deck.pop()!)
    }
    last = deck.pop()!
    return last
  }
}

export function makeQuestion(rng: Rng, groups: RhymeGroup[], index: number, count: number): Question {
  const group = groups[index]
  const [target, answer] = rng.shuffle([...group.words])
  const others = groups.filter((o) => o.sound !== group.sound)
  const wrong = rng.shuffle([...others]).slice(0, count - 1).map((o) => rng.pick(o.words))
  return { target, answer, options: rng.shuffle([answer, ...wrong]) }
}

/** Faster answers and longer streaks earn more. */
export function pointsFor(seconds: number, combo: number) {
  return 10 + clamp(Math.round((4 - seconds) * 3), 0, 12) + Math.min(combo, 8) * 2
}
