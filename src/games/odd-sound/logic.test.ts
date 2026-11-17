import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { makeTask, SCALE, specFor, startTimes } from './logic'

describe('odd sound', () => {
  it('makes one odd song among identical ones at every level', () => {
    for (let level = 1; level <= 10; level++) {
      const rng = makeRng(level * 7)
      const spec = specFor(level)
      for (let i = 0; i < 200; i++) {
        const task = makeTask(rng, level)
        expect(task.songs).toHaveLength(spec.birds)
        const same = task.songs.filter((_, b) => b !== task.odd)
        same.forEach((s) => expect(s).toEqual(same[0]))
        expect(task.songs[task.odd].join()).not.toBe(same[0].join())
        task.songs.forEach((s) => {
          expect(s).toHaveLength(spec.notes)
          s.forEach((n) => expect(n >= 0 && n < SCALE.length).toBe(true))
        })
      }
    }
  })

  it('changes one note by at least the level step on note levels', () => {
    for (let level = 5; level <= 10; level++) {
      const rng = makeRng(level)
      const { step } = specFor(level)
      for (let i = 0; i < 200; i++) {
        const task = makeTask(rng, level)
        const odd = task.songs[task.odd]
        const same = task.songs[(task.odd + 1) % task.songs.length]
        const diffs = odd.map((n, k) => n - same[k]).filter((d) => d !== 0)
        expect(diffs).toHaveLength(1)
        expect(Math.abs(diffs[0])).toBeGreaterThanOrEqual(step)
        expect(odd[0]).toBe(same[0])
      }
    }
  })

  it('moves the whole tune an octave on level 1', () => {
    const rng = makeRng(3)
    for (let i = 0; i < 50; i++) {
      const task = makeTask(rng, 1)
      const odd = task.songs[task.odd]
      const same = task.songs[(task.odd + 1) % 3]
      const shift = odd[0] - same[0]
      expect(Math.abs(shift)).toBe(5)
      odd.forEach((n, k) => expect(n - same[k]).toBe(shift))
    }
  })

  it('does not put the odd bird in the same spot twice in a row when asked', () => {
    const rng = makeRng(11)
    let last = -1
    for (let i = 0; i < 100; i++) {
      const task = makeTask(rng, 4, last)
      expect(task.odd).not.toBe(last)
      last = task.odd
    }
  })

  it('lets the birds sing one after another', () => {
    const task = makeTask(makeRng(1), 7)
    const times = startTimes(task)
    expect(times[0]).toBe(0)
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1])
  })
})
