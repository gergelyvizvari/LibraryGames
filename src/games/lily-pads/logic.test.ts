import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { layPad, makeDealer, perPad, PICS, picKey, STAGE } from './logic'

describe('lily pad pairs', () => {
  it('has enough different pictures for the biggest pads', () => {
    expect(new Set(PICS.map(picKey)).size).toBe(PICS.length)
    expect(PICS.length).toBeGreaterThanOrEqual(perPad(10) * 2 - 1 + 6)
  })

  it.each([1, 3, 5, 7, 9, 10])('puts exactly one picture on both pads at level %i', (level) => {
    const deal = makeDealer(makeRng(level * 7), level)
    for (let i = 0; i < 40; i++) {
      const { shared, pads } = deal()
      const [a, b] = pads.map((pad) => pad.items.map((p) => picKey(p.pic)))
      expect(a).toHaveLength(perPad(level))
      expect(b).toHaveLength(perPad(level))
      expect(new Set(a).size).toBe(a.length)
      expect(new Set(b).size).toBe(b.length)
      expect(a.filter((k) => b.includes(k))).toEqual([picKey(shared)])
    }
  })

  it('never shares the same picture twice in a row and goes through them all', () => {
    const deal = makeDealer(makeRng(3), 4)
    const seen: string[] = []
    for (let i = 0; i < PICS.length * 3; i++) seen.push(picKey(deal().shared))
    seen.forEach((k, i) => i > 0 && expect(k).not.toBe(seen[i - 1]))
    expect(new Set(seen.slice(0, PICS.length)).size).toBe(PICS.length)
  })

  it.each([3, 4, 5, 6, 7])('lays %i pictures on a pad without overlaps, inside the pad', (n) => {
    for (const level of [1, 6, 10]) {
      const { items: placed, notch } = layPad(makeRng(n + level), PICS.slice(0, n), level)
      placed.forEach((p, i) => {
        // The notch runs between pictures: none on the ring sits within 20 degrees of it.
        const deg = (((Math.atan2(p.y, p.x) * 180) / Math.PI - notch) % 360 + 540) % 360 - 180
        if (Math.hypot(p.x, p.y) > 0.1) expect(Math.abs(deg)).toBeGreaterThan(20)
        expect(Math.hypot(p.x, p.y) + p.size / 2).toBeLessThanOrEqual(0.9)
        placed.slice(i + 1).forEach((q) => expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThanOrEqual((p.size + q.size) / 2))
      })
    }
  })

  it('keeps the easy levels tidy and turns pictures only later', () => {
    const easy = makeDealer(makeRng(1), 1)()
    easy.pads.flatMap((pad) => pad.items).forEach((p) => expect(p.rotate).toBe(0))
    expect(STAGE).toBeGreaterThan(3)
  })
})
