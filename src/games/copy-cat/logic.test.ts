import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { lines, linesFor } from './content'
import { isTypingKey, keyMatches, makeDealer, wordsOf } from './logic'

describe('copy cat logic', () => {
  it('ignores capitals', () => {
    expect(keyMatches('t', 'T', 9)).toBe(true)
    expect(keyMatches('T', 't', 9)).toBe(true)
    expect(keyMatches('t', 'r', 1)).toBe(false)
  })
  it('lets the youngest skip accents, but not later', () => {
    expect(keyMatches('é', 'e', 2)).toBe(true)
    expect(keyMatches('ő', 'o', 4)).toBe(true)
    expect(keyMatches('é', 'e', 5)).toBe(false)
    expect(keyMatches('é', 'é', 8)).toBe(true)
    expect(keyMatches('e', 'é', 8)).toBe(false)
  })
  it('wants a real space between words', () => {
    expect(keyMatches(' ', ' ', 1)).toBe(true)
    expect(keyMatches(' ', 'a', 1)).toBe(false)
  })
  it('only counts letters and the space bar as typing', () => {
    expect(isTypingKey('a')).toBe(true)
    expect(isTypingKey('ű')).toBe(true)
    expect(isTypingKey(' ')).toBe(true)
    expect(isTypingKey('Shift')).toBe(false)
    expect(isTypingKey('ArrowLeft')).toBe(false)
    expect(isTypingKey('1')).toBe(false)
    expect(isTypingKey('Dead')).toBe(false)
  })
  it('splits a line into words with their start', () => {
    expect(wordsOf('a red ball')).toEqual([
      { word: 'a', start: 0 },
      { word: 'red', start: 2 },
      { word: 'ball', start: 6 },
    ])
  })
  it('deals every line once before any comes back, and never twice in a row', () => {
    for (const level of [1, 3, 6, 10]) {
      const pool = linesFor(lines.en, level)
      const deal = makeDealer(makeRng(level), lines.en, level)
      const first = Array.from({ length: pool.length }, deal)
      expect(new Set(first).size).toBe(pool.length)
      let prev = first[first.length - 1]
      for (let i = 0; i < pool.length * 2; i++) {
        const next = deal()
        expect(next).not.toBe(prev)
        prev = next
      }
    }
  })
  it('gives words at level 1 and sentences at level 10', () => {
    expect(linesFor(lines.en, 1).every((x) => !x.text.includes(' '))).toBe(true)
    expect(linesFor(lines.en, 10).every((x) => x.text.split(' ').length >= 4)).toBe(true)
  })
})
