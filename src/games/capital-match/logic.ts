import type { Rng } from '../../kit/random'
import type { Country } from './content'

export const QUESTIONS = 10

export interface Question {
  country: Country
  options: string[]
}

export function makeQuestions(rng: Rng, list: Country[], level: number): Question[] {
  const pool = list.filter((c) => c.minLevel <= level)
  return rng
    .shuffle(pool)
    .slice(0, QUESTIONS)
    .map((country) => {
      // Wrong answers come from the whole list, so a famous capital can be a trick answer too.
      const wrong = rng.shuffle(list.filter((c) => c !== country)).slice(0, 2).map((c) => c.capital)
      return { country, options: rng.shuffle([country.capital, ...wrong]) }
    })
}
