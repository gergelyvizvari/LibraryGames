import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { words } from './content'
import { scramble } from './logic'

describe('anagram race', () => {
  it('scrambles every word into the same letters, out of order', () => {
    const rng = makeRng(8)
    words.en.forEach(({ word }) => {
      const tiles = scramble(rng, word)
      expect(tiles.map((t) => t.letter).sort().join('')).toBe([...word].sort().join(''))
      if (new Set(word).size > 1) expect(tiles.map((t) => t.letter).join('')).not.toBe(word)
    })
  })
})
