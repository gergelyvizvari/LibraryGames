import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { sentences } from './content'
import { isNext, tilesFor } from './logic'

describe('sentence builder', () => {
  it('shuffles all the words of each sentence', () => {
    const rng = makeRng(3)
    sentences.en.forEach((s) => {
      const tiles = tilesFor(rng, s.text)
      expect(tiles.map((t) => t.word).sort()).toEqual(s.text.split(' ').sort())
    })
  })
  it('accepts either copy of a repeated word', () => {
    expect(isNext('The cat is on the bed', 4, 'the')).toBe(true)
    expect(isNext('The cat is on the bed', 4, 'bed')).toBe(false)
  })
})
