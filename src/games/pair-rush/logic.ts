import type { Rng } from '../../kit/random'

export const faces = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🦁', '🐯', '🐷', '🐮', '🐰', '🐨', '🐙', '🦄', '🐝', '🐢', '🦋', '🐳']

/** Number of cards per board, smallest first. Each cleared board moves to the next size. */
export const boardSizes = [4, 6, 8, 12, 16, 20]

export function startBoard(level: number) {
  return Math.min(boardSizes.length - 1, Math.floor((level - 1) / 2))
}

export function columnsFor(cards: number) {
  return cards <= 4 ? 2 : cards <= 12 ? (cards === 6 ? 3 : 4) : cards === 16 ? 4 : 5
}

export interface Card {
  id: number
  face: string
  matched: boolean
}

export function deal(rng: Rng, cards: number): Card[] {
  const chosen = rng.shuffle(faces).slice(0, cards / 2)
  return rng.shuffle([...chosen, ...chosen]).map((face, id) => ({ id, face, matched: false }))
}
