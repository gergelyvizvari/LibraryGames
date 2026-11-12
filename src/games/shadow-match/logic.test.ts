import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { choiceCount, makeDealer, SHAPES, shapeKey, turnCss, turnFor } from './logic'

describe('shadow match logic', () => {
  it('has plenty of different shapes', () => {
    expect(SHAPES.length).toBeGreaterThanOrEqual(20)
    expect(new Set(SHAPES.map(shapeKey)).size).toBe(SHAPES.length)
  })
  it('offers 3 choices first, then 4, always with the right one and no repeats', () => {
    for (const level of [1, 4, 5, 10]) {
      const deal = makeDealer(makeRng(level), level)
      for (let i = 0; i < 40; i++) {
        const task = deal()
        expect(task.choices).toHaveLength(choiceCount(level))
        expect(task.choices).toContain(task.target)
        expect(new Set(task.choices).size).toBe(task.choices.length)
      }
    }
    expect(choiceCount(1)).toBe(3)
    expect(choiceCount(10)).toBe(4)
  })
  it('shows every shape once before any comes back, never twice in a row', () => {
    const deal = makeDealer(makeRng(3), 3)
    const first = Array.from({ length: SHAPES.length }, () => deal().target)
    expect(new Set(first).size).toBe(SHAPES.length)
    let prev = first[first.length - 1]
    for (let i = 0; i < SHAPES.length * 2; i++) {
      const next = deal().target
      expect(next).not.toBe(prev)
      prev = next
    }
  })
  it('keeps the wrong answers unlike the right one at level 1 and alike at level 10', () => {
    const easy = makeDealer(makeRng(5), 1)
    const hard = makeDealer(makeRng(5), 10)
    for (let i = 0; i < 40; i++) {
      const e = easy()
      expect(e.choices.filter((c) => c !== e.target).every((c) => c.group !== e.target.group)).toBe(true)
      const h = hard()
      expect(h.choices.filter((c) => c !== h.target).some((c) => c.group === h.target.group)).toBe(true)
    }
  })
  it('turns the shadow only from level 5, and on its side only from level 7', () => {
    const rng = makeRng(9)
    for (let i = 0; i < 50; i++) {
      expect(turnFor(rng, 3)).toEqual({ rotate: 0, flip: false })
      expect(turnFor(rng, 6).rotate).toBe(0)
    }
    const seen = new Set(Array.from({ length: 80 }, () => turnFor(rng, 9).rotate))
    expect(seen.size).toBe(4)
  })
  it('writes the turn as CSS', () => {
    expect(turnCss({ rotate: 0, flip: false })).toBe('rotate(0deg)')
    expect(turnCss({ rotate: 90, flip: true })).toBe('rotate(90deg) scaleX(-1)')
  })
})
