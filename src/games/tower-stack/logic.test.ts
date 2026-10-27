import { describe, expect, it } from 'vitest'
import { drop, speedFor } from './logic'

describe('tower stack', () => {
  it('snaps near-perfect drops', () => {
    const r = drop({ x: 21, w: 40 }, { x: 20, w: 40 })
    expect(r.perfect).toBe(true)
    expect(r.placed).toEqual({ x: 20, w: 42 })
  })
  it('cuts the overhang', () => {
    const r = drop({ x: 30, w: 40 }, { x: 20, w: 40 })
    expect(r.placed).toEqual({ x: 30, w: 30 })
    expect(r.cut).toBe(10)
  })
  it('misses when nothing overlaps', () => {
    expect(drop({ x: 70, w: 20 }, { x: 20, w: 40 }).placed).toBeNull()
  })
  it('speeds up as the tower grows', () => {
    expect(speedFor(1, 10)).toBeGreaterThan(speedFor(1, 0))
  })
})
