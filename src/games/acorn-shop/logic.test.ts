import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { canPay, makeTask, pay, specFor, sum } from './logic'

describe('acorn shop', () => {
  it('prices fit the level and a purse can always pay exactly', () => {
    for (let level = 1; level <= 10; level++) {
      const rng = makeRng(level * 13)
      const spec = specFor(level)
      let last
      for (let i = 0; i < 300; i++) {
        const task = makeTask(rng, level, last)
        expect(task.price).toBeGreaterThanOrEqual(spec.min)
        expect(task.price).toBeLessThanOrEqual(spec.max)
        if (last) {
          expect(task.snack).not.toBe(last.snack)
          expect(task.price).not.toBe(last.price)
        }
        if (spec.extra === null) expect(task.purse).toBeNull()
        else {
          expect(task.purse).not.toBeNull()
          expect(canPay(task.purse!, task.price)).toBe(true)
          expect(sum(task.purse!)).toBeGreaterThan(task.price)
          task.purse!.forEach((c) => expect(spec.coins).toContain(c))
        }
        last = task
      }
    }
  })

  it('starts with ones only', () => {
    expect(specFor(1).coins).toEqual([1])
    expect(specFor(1).max).toBeLessThanOrEqual(5)
  })

  it('tells short, exact and too much apart', () => {
    expect(pay([2], 2, 7)).toBe('short')
    expect(pay([5], 2, 7)).toBe('exact')
    expect(pay([5, 1], 2, 7)).toBe('over')
  })

  it('finds exact sums', () => {
    expect(canPay([5, 2, 2], 4)).toBe(true)
    expect(canPay([5, 5], 3)).toBe(false)
  })
})
