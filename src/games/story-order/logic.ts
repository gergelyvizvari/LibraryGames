import { clamp, type Rng } from '../../kit/random'
import { storiesFor, type Story } from './content'

export const DURATION = 75

const lv = (level: number) => clamp(Math.round(level), 1, 10)
/** Pictures help early readers; from level 7 the sentences stand alone. */
export const showPictures = (level: number) => lv(level) <= 6

export interface Card {
  /** Where this card belongs in the story, from 0. */
  step: number
  emoji: string
  text: string
}

/** Shuffles the steps of a story, never leaving them already in the right order. */
export function shuffleCards(rng: Rng, story: Story): Card[] {
  const cards = story.steps.map((x, step) => ({ step, ...x }))
  let out = rng.shuffle(cards)
  for (let i = 0; i < 20 && out.every((c, k) => c.step === k); i++) out = rng.shuffle(cards)
  // A tiny story could keep coming out in order: swap the first two.
  if (out.every((c, k) => c.step === k)) [out[0], out[1]] = [out[1], out[0]]
  return out
}

/** Deals stories for the level in a shuffled order; none comes back until the whole pool has been used. */
export function makeDealer(rng: Rng, list: Story[], level: number) {
  const pool = storiesFor(list, level)
  let deck: Story[] = []
  let last: Story | null = null
  return (): Story => {
    if (deck.length === 0) {
      deck = rng.shuffle(pool)
      // The last story of one round never opens the next.
      if (deck.length > 1 && deck[deck.length - 1] === last) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]]
    }
    last = deck.pop()!
    return last
  }
}

/** Which question to ask while the player looks for card number `placed`. */
export const askKey = (placed: number, total: number) => (placed === 0 ? 'first' : placed === total - 1 ? 'last' : 'next')

/** A streak of right taps earns more. */
export const stepPoints = (combo: number) => 10 + Math.min(combo, 10) * 2
/** Bonus for a story put together without a single mistake. */
export const PERFECT_BONUS = 15

/** Right taps count, and a long enough round (5 stories) is needed for full marks. */
export const accuracyFor = (right: number, wrong: number, stories: number) =>
  clamp(right / Math.max(1, right + wrong), 0, 1) * clamp(stories / 5, 0, 1)
