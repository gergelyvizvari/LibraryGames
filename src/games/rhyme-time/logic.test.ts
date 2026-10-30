import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { rhymes } from './content'
import { makeDealer, makeQuestion, optionCount, pointsFor, showPictures } from './logic'

describe.each(Object.entries(rhymes))('rhyme time questions (%s)', (_, groups) => {
  it('always has exactly one rhyming answer', () => {
    const rng = makeRng(4)
    const deal = makeDealer(rng, groups)
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 40; i++) {
        const gi = deal()
        const q = makeQuestion(rng, groups, gi, optionCount(level))
        expect(q.options).toHaveLength(optionCount(level))
        expect(q.options).toContain(q.answer)
        expect(q.answer).not.toBe(q.target)
        const sound = groups[gi].sound
        const rhyming = q.options.filter((o) => groups.some((gr) => gr.sound === sound && gr.words.includes(o)))
        expect(rhyming).toEqual([q.answer])
        expect(new Set(q.options.map((o) => o.word)).size).toBe(q.options.length)
      }
    }
  })
  it('does not repeat a group back to back', () => {
    const deal = makeDealer(makeRng(8), groups)
    let prev = -1
    for (let i = 0; i < 200; i++) {
      const gi = deal()
      expect(gi).not.toBe(prev)
      prev = gi
    }
  })
})

describe('rhyme time rules', () => {
  it('starts easy', () => {
    expect(optionCount(1)).toBe(3)
    expect(showPictures(1)).toBe(true)
    expect(showPictures(7)).toBe(false)
  })
  it('rewards speed and streaks', () => {
    expect(pointsFor(1, 0)).toBeGreaterThan(pointsFor(5, 0))
    expect(pointsFor(5, 4)).toBeGreaterThan(pointsFor(5, 0))
  })
})
