import { describe, expect, it } from 'vitest'
import { lettersForLevel } from './logic'

describe('letter pop', () => {
  it('starts on the home row and ends with the whole alphabet', () => {
    expect(lettersForLevel(1)).toBe('asdfjkl')
    expect([...lettersForLevel(10)].sort().join('')).toBe('abcdefghijklmnopqrstuvwxyz')
  })
})
