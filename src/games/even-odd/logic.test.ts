import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { accuracyFor, binFor, explain, fallSeconds, makeDealer, numberRange, pointsFor, showDots, swipeBin } from './logic'

describe('even odd numbers', () => {
  it('knows even from odd', () => {
    expect(binFor(2)).toBe('even')
    expect(binFor(7)).toBe('odd')
    expect(binFor(1000)).toBe('even')
  })
  it('deals in range, without repeats or long runs of one kind', () => {
    for (let level = 1; level <= 10; level++) {
      const [lo, hi] = numberRange(level)
      const deal = makeDealer(makeRng(level), level)
      const seq = Array.from({ length: 300 }, deal)
      let run = 1
      for (let i = 0; i < seq.length; i++) {
        expect(seq[i]).toBeGreaterThanOrEqual(lo)
        expect(seq[i]).toBeLessThanOrEqual(hi)
        if (i === 0) continue
        expect(seq[i]).not.toBe(seq[i - 1])
        run = binFor(seq[i]) === binFor(seq[i - 1]) ? run + 1 : 1
        expect(run).toBeLessThanOrEqual(3)
      }
      expect(seq.some((n) => n % 2 === 0) && seq.some((n) => n % 2 === 1)).toBe(true)
    }
  })
  it('starts small, slow and with dots, and grows', () => {
    expect(numberRange(1)).toEqual([1, 6])
    expect(showDots(1)).toBe(true)
    expect(showDots(4)).toBe(false)
    expect(fallSeconds(1)).toBeGreaterThan(fallSeconds(10))
    expect(fallSeconds(10)).toBeGreaterThan(2)
    expect(numberRange(10)[1]).toBeGreaterThan(numberRange(5)[1])
  })
})

describe('even odd input and feedback', () => {
  it('reads swipes', () => {
    expect(swipeBin(-80, 5)).toBe('even')
    expect(swipeBin(80, -10)).toBe('odd')
    expect(swipeBin(10, 0)).toBeNull()
    expect(swipeBin(40, 90)).toBeNull()
  })
  it('explains with pairs, then with the last digit', () => {
    expect(explain(8)).toEqual({ key: 'whyEven', vars: { n: 8, half: 4 } })
    expect(explain(9)).toEqual({ key: 'whyOdd', vars: { n: 9, half: 4 } })
    expect(explain(1).key).toBe('whyOne')
    expect(explain(347)).toEqual({ key: 'digitOdd', vars: { n: 347, d: 7 } })
    expect(explain(30)).toEqual({ key: 'digitEven', vars: { n: 30, d: 0 } })
  })
  it('scores streaks, speed and accuracy', () => {
    expect(pointsFor(5, 0)).toBeGreaterThan(pointsFor(1, 0))
    expect(pointsFor(1, 1)).toBeGreaterThan(pointsFor(1, 0))
    expect(accuracyFor(15, 0)).toBe(1)
    expect(accuracyFor(15, 5)).toBeLessThan(1)
    expect(accuracyFor(5, 0)).toBeLessThan(1)
  })
})
