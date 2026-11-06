import { describe, expect, it } from 'vitest'
import { dotGapFor, nearestDot } from './mapHunt'

describe('map hunt dots', () => {
  it('picks the nearest dot within reach, and none when the tap is far from all', () => {
    const dots: [number, number][] = [[100, 100], [160, 100], [500, 500]]
    expect(nearestDot(dots, [125, 100])).toBe(0)
    expect(nearestDot(dots, [140, 100])).toBe(1)
    expect(nearestDot(dots, [520, 480])).toBe(2)
    expect(nearestDot(dots, [300, 300])).toBe(-1)
  })

  it('spreads dots further apart on the first two levels', () => {
    expect(dotGapFor(1, 100)).toBeGreaterThan(100)
    expect(dotGapFor(2, 100)).toBeGreaterThan(100)
    expect(dotGapFor(3, 100)).toBe(100)
  })
})
