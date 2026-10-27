import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import { countries } from './content'
import { makeQuestions } from './logic'

describe('capital match', () => {
  it('asks ten different countries with the right capital among three options', () => {
    const rng = makeRng(4)
    for (let level = 1; level <= 10; level++) {
      const qs = makeQuestions(rng, countries.en, level)
      expect(qs).toHaveLength(10)
      expect(new Set(qs.map((q) => q.country.name)).size).toBe(10)
      qs.forEach((q) => {
        expect(q.options).toHaveLength(3)
        expect(q.options.filter((o) => o === q.country.capital)).toHaveLength(1)
      })
    }
  })
})
