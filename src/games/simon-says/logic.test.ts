import { describe, expect, it } from 'vitest'
import { judge } from './logic'

describe('simon says', () => {
  it('judges taps and waits', () => {
    expect(judge({ animal: 1, simon: true }, 1)).toBe('right')
    expect(judge({ animal: 1, simon: true }, 2)).toBe('wrongAnimal')
    expect(judge({ animal: 1, simon: false }, 1)).toBe('noSimon')
    expect(judge({ animal: 1, simon: false }, null)).toBe('waited')
    expect(judge({ animal: 1, simon: true }, null)).toBe('tooSlow')
  })
})
