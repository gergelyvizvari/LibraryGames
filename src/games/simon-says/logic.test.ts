import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import strings from './strings'
import { animals, judge, makeOrders, pickAnimals } from './logic'

describe('simon says', () => {
  it('judges taps and waits', () => {
    expect(judge({ animal: 1, simon: true }, 1)).toBe('right')
    expect(judge({ animal: 1, simon: true }, 2)).toBe('wrongAnimal')
    expect(judge({ animal: 1, simon: false }, 1)).toBe('noSimon')
    expect(judge({ animal: 1, simon: false }, null)).toBe('waited')
    expect(judge({ animal: 1, simon: true }, null)).toBe('tooSlow')
  })
  it('never repeats the same animal twice in a row', () => {
    const rng = makeRng(3)
    for (let level = 1; level <= 10; level++) {
      const shown = pickAnimals(rng, level)
      const orders = makeOrders(rng, level, shown.length)
      orders.forEach((o, i) => {
        expect(o.animal).toBeLessThan(shown.length)
        if (i > 0) expect(o.animal).not.toBe(orders[i - 1].animal)
      })
    }
  })
  it('has a name for every animal', () => {
    animals.forEach((a) => expect(strings.en[a.key]).toBeTruthy())
  })
})
