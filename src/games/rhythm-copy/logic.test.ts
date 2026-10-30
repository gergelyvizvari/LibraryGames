import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { BAR, cellBeats, grade, hitTimes, judge, makePattern } from './logic'

describe('rhythm copy', () => {
  it('makes patterns that fill whole 4/4 bars and start on beat 1', () => {
    const rng = makeRng(3)
    for (let level = 1; level <= 10; level++) {
      for (let round = 0; round < 8; round++) {
        const p = makePattern(rng, level, round)
        const beats = p.cells.reduce((sum, c) => sum + cellBeats[c], 0)
        expect(beats).toBe(p.beats)
        expect(p.beats % BAR).toBe(0)
        expect(p.hits[0]).toBe(0)
        // Every hit falls on a beat or exactly halfway between two.
        p.hits.forEach((h) => expect((h * 2) % 1).toBe(0))
        p.hits.slice(1).forEach((h, i) => expect(h).toBeGreaterThan(p.hits[i]))
      }
    }
  })
  it('keeps half notes off the middle of the bar and rests out of the easiest levels', () => {
    const rng = makeRng(8)
    for (let i = 0; i < 200; i++) {
      const level = 1 + (i % 10)
      const p = makePattern(rng, level, i % 8)
      let at = 0
      for (const c of p.cells) {
        if (c === 'taa') expect(at % 2).toBe(0)
        if (level < 3) expect(c).not.toBe('rest')
        at += cellBeats[c]
      }
    }
  })
  it('turns cells into hit times', () => {
    expect(hitTimes(['ta', 'titi', 'rest', 'ta'])).toEqual([0, 1, 1.5, 3])
    expect(hitTimes(['taa', 'titi', 'ta'])).toEqual([0, 2, 2.5, 3])
  })

  const beat = 500
  const hits = [0, 500, 750, 1500].map((h) => h + 4000)
  it('scores taps on the beat as perfect, and forgives a steady lag', () => {
    expect(judge(hits, hits, beat).score).toBe(1)
    expect(judge(hits, hits.map((h) => h + 90), beat).score).toBe(1)
  })
  it('scores taps that drift off the pulse lower', () => {
    // Same count, but the gaps wander: the old gap-only scoring would have passed parts of this.
    const drift = [4000, 4650, 4950, 5250]
    expect(judge(hits, drift, beat).score).toBeLessThan(0.7)
  })
  it('gives partial credit for a missed hit and charges for extra taps', () => {
    const missOne = judge(hits, [hits[0], hits[1], hits[3]], beat)
    expect(missOne.score).toBeCloseTo(0.75)
    expect(missOne.credits).toEqual([1, 1, 0, 1])
    expect(judge(hits, [...hits, 6000, 6200], beat).score).toBeCloseTo(4 / 6)
    expect(judge(hits, [], beat).score).toBe(0)
  })
  it('is roomier with timing on easy levels than on hard ones', () => {
    // One tap a fifth of a beat early, the rest on time.
    const taps = [hits[0], hits[1] - 100, hits[2], hits[3]]
    expect(judge(hits, taps, beat, 1).score).toBe(1)
    expect(judge(hits, taps, beat, 10).score).toBeLessThan(1)
  })
  it('grades scores', () => {
    expect(grade(1)).toBe('perfect')
    expect(grade(0.1)).toBe('oops')
  })
})
