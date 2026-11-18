import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { AREA, drift, glowing, spawn, specFor } from './logic'

describe('firefly night', () => {
  it('starts every firefly asleep, inside the meadow', () => {
    const rng = makeRng(4)
    for (let level = 1; level <= 10; level++) {
      const spec = specFor(level)
      for (let i = 0; i < 100; i++) {
        const fly = spawn(rng, spec, i)
        expect(glowing(fly, 0, spec)).toBe(false)
        expect(fly.x >= AREA.left && fly.x <= AREA.right).toBe(true)
        expect(fly.y >= AREA.top && fly.y <= AREA.bottom).toBe(true)
      }
    }
  })

  it('glows for `glow` seconds of every cycle', () => {
    const spec = specFor(1)
    const fly = { id: 0, x: 50, y: 50, dx: 0, dy: 0, offset: 0 }
    expect(glowing(fly, 0.1, spec)).toBe(true)
    expect(glowing(fly, spec.glow + 0.1, spec)).toBe(false)
    expect(glowing(fly, spec.glow + spec.dark + 0.1, spec)).toBe(true)
    let lit = 0
    for (let t = 0; t < 100; t += 0.01) if (glowing(fly, t, spec)) lit++
    expect(lit / 10000).toBeCloseTo(spec.glow / (spec.glow + spec.dark), 1)
  })

  it('keeps drifting fireflies inside the meadow', () => {
    const rng = makeRng(9)
    const spec = specFor(10)
    let fly = spawn(rng, spec, 0)
    for (let i = 0; i < 5000; i++) {
      fly = drift(fly, 0.05)
      expect(fly.x >= AREA.left && fly.x <= AREA.right).toBe(true)
      expect(fly.y >= AREA.top && fly.y <= AREA.bottom).toBe(true)
    }
  })

  it('gets busier and quicker', () => {
    expect(specFor(10).count).toBeGreaterThan(specFor(1).count)
    expect(specFor(10).glow).toBeLessThan(specFor(1).glow)
    expect(specFor(10).speed).toBeGreaterThan(specFor(1).speed)
  })
})
