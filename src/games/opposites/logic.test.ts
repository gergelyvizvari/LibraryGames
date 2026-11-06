import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { pairs, poolFor } from './content'
import { accuracyFor, boardBonus, dealBoard, isMatch, makeDealer, pairCount, pairPoints, showPictures } from './logic'

describe.each(Object.entries(pairs))('opposites boards (%s)', (_, list) => {
  it('deals full boards from the level pool with one answer per word', () => {
    for (let level = 1; level <= 10; level++) {
      const rng = makeRng(level * 7)
      const deal = makeDealer(rng, list, level)
      const pool = poolFor(list, level)
      for (let i = 0; i < 30; i++) {
        const picked = deal()
        expect(picked).toHaveLength(pairCount(level))
        expect(new Set(picked).size).toBe(picked.length)
        expect(new Set(picked.map((q) => q.group)).size).toBe(picked.length)
        for (const q of picked) expect(pool).toContain(q)
        const board = dealBoard(rng, picked)
        expect(board.left).toHaveLength(picked.length)
        expect(board.right).toHaveLength(picked.length)
        for (const l of board.left) expect(board.right.filter((r) => isMatch(l, r))).toHaveLength(1)
      }
    }
  })
  it('never brings back a pair from the board before', () => {
    const deal = makeDealer(makeRng(3), list, 1)
    let prev = deal()
    for (let i = 0; i < 100; i++) {
      const now = deal()
      for (const q of now) expect(prev).not.toContain(q)
      prev = now
    }
  })
  it('shows every pair in the pool before repeating one', () => {
    const level = 4
    const deal = makeDealer(makeRng(11), list, level)
    const seen = new Set()
    const boards = Math.floor(poolFor(list, level).length / pairCount(level))
    for (let i = 0; i < boards; i++) for (const q of deal()) seen.add(q)
    expect(seen.size).toBeGreaterThanOrEqual(boards * pairCount(level) - pairCount(level))
  })
})

describe('opposites rules', () => {
  it('starts easy and grows', () => {
    expect(pairCount(1)).toBe(4)
    expect(pairCount(10)).toBe(6)
    expect(showPictures(1)).toBe(true)
    expect(showPictures(6)).toBe(false)
  })
  it('matches only across the columns', () => {
    const a = { pair: 0, side: 'left' as const, word: 'hot' }
    expect(isMatch(a, { pair: 0, side: 'right', word: 'cold' })).toBe(true)
    expect(isMatch(a, { pair: 1, side: 'right', word: 'sad' })).toBe(false)
    expect(isMatch(a, { ...a })).toBe(false)
  })
  it('rewards streaks, full boards and getting it right', () => {
    expect(pairPoints(5)).toBeGreaterThan(pairPoints(1))
    expect(boardBonus(6)).toBeGreaterThan(boardBonus(3))
    expect(accuracyFor(12, 0)).toBe(1)
    expect(accuracyFor(12, 6)).toBeLessThan(1)
    expect(accuracyFor(3, 0)).toBeLessThan(1)
    expect(accuracyFor(0, 0)).toBe(0)
  })
})
