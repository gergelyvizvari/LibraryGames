import { describe, expect, it } from 'vitest'
import { accuracyFor, animalKey, pointsFor } from './logic'

describe('lights out scoring', () => {
  it('rewards faster reactions', () => {
    expect(pointsFor(200)).toBeGreaterThan(pointsFor(400))
    expect(pointsFor(5000)).toBe(0)
  })
  it('maps times to animals', () => {
    expect(animalKey(200)).toBe('cheetah')
    expect(animalKey(900)).toBe('turtle')
  })
  it('gives full accuracy at 300 ms average', () => {
    expect(accuracyFor([300, 300])).toBe(1)
    expect(accuracyFor([800])).toBe(0)
  })
})
