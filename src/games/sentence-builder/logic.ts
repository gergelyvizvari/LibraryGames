import type { Rng } from '../../kit/random'

export interface Tile {
  id: number
  word: string
}

export function tilesFor(rng: Rng, text: string): Tile[] {
  const tiles = text.split(' ').map((word, id) => ({ id, word }))
  let out = rng.shuffle(tiles)
  for (let i = 0; i < 10 && out.map((t) => t.word).join(' ') === text; i++) out = rng.shuffle(tiles)
  return out
}

/** The next tile is right if its word matches the next word (duplicates like "the" are interchangeable). */
export function isNext(text: string, builtCount: number, word: string) {
  return text.split(' ')[builtCount] === word
}
