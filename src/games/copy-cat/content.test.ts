import { describe, expect, it } from 'vitest'
import { lines, linesFor } from './content'

describe.each(Object.entries(lines))('copy cat content (%s)', (_, list) => {
  it('has at least 20 lines at every level', () => {
    for (let level = 1; level <= 10; level++) expect(linesFor(list, level).length).toBeGreaterThanOrEqual(20)
  })
  it('swaps the easy lines out at the top levels', () => {
    const top = linesFor(list, 10)
    expect(linesFor(list, 1).some((x) => top.includes(x))).toBe(false)
  })
  it('only uses letters and single spaces, NFC normalised and short enough for one note', () => {
    for (const { text } of list) {
      expect(text).toBe(text.normalize('NFC'))
      expect(text).toMatch(/^\p{L}+( \p{L}+)*$/u)
      expect(text.length).toBeLessThanOrEqual(30)
    }
  })
  it('never repeats a line', () => {
    const keys = list.map((x) => x.text.toLowerCase())
    expect(new Set(keys).size).toBe(keys.length)
  })
})

it('has the same amount of lines per level in every language', () => {
  for (let level = 1; level <= 10; level++) expect(linesFor(lines.hu, level).length).toBe(linesFor(lines.en, level).length)
})
