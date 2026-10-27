import { clamp, type Rng } from '../../kit/random'

export const colours = [
  { key: 'red', css: '#ff4757' },
  { key: 'blue', css: '#3742fa' },
  { key: 'green', css: '#2ed573' },
  { key: 'yellow', css: '#ffa502' },
] as const

export type Rule = 'ink' | 'word'

export interface Card {
  word: number
  ink: number
  rule: Rule
}

/** Chance that the word and ink disagree. Easy at level 1, nearly always tricky by level 6. */
export const clashChance = (level: number) => clamp(0.35 + level * 0.1, 0.35, 0.9)

/** From level 4 the rule sometimes flips to "tap the word". */
export const flipChance = (level: number) => (level < 4 ? 0 : clamp((level - 3) * 0.08, 0, 0.35))

export function makeCard(rng: Rng, level: number): Card {
  const word = rng.int(0, colours.length - 1)
  let ink = word
  if (rng.chance(clashChance(level))) {
    while (ink === word) ink = rng.int(0, colours.length - 1)
  }
  return { word, ink, rule: rng.chance(flipChance(level)) ? 'word' : 'ink' }
}

export const answerFor = (card: Card) => (card.rule === 'ink' ? card.ink : card.word)
