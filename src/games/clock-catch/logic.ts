import { clamp, type Rng } from '../../kit/random'

export const DURATION = 60

export interface Time {
  h: number // 1..12
  m: number // 0..59
}

/**
 * Minutes between possible times: whole hours at level 1, then halves (so level 2 already has 24 times to read,
 * not the same 12 again), quarters, fives and any minute.
 */
export function stepFor(level: number) {
  return level <= 1 ? 60 : level <= 4 ? 30 : level <= 6 ? 15 : level <= 8 ? 5 : 1
}

export const optionCount = (level: number) => (level <= 2 ? 3 : 4)

/** From level 3 every other question flips: a digital time, pick the right clock. */
export const flipped = (level: number, index: number) => level >= 3 && index % 2 === 1

export const same = (a: Time, b: Time) => a.h === b.h && a.m === b.m
export const label = (t: Time) => `${t.h}:${String(t.m).padStart(2, '0')}`

const wrapH = (h: number) => ((((h - 1) % 12) + 12) % 12) + 1

export function randomTime(rng: Rng, step: number): Time {
  return { h: rng.int(1, 12), m: rng.int(0, Math.floor(59 / step)) * (step === 60 ? 0 : step) }
}

/** Deals the times of one stage: none comes twice until every time on the level's grid has been shown. */
export function makeTimeDealer(rng: Rng, level: number) {
  const step = stepFor(level)
  const seen = new Set<string>()
  const all = 12 * (step === 60 ? 1 : 60 / step)
  return (): Time => {
    if (seen.size >= all) seen.clear()
    let t = randomTime(rng, step)
    while (seen.has(label(t))) t = randomTime(rng, step)
    seen.add(label(t))
    return t
  }
}

/** Hand angles in degrees, clockwise from 12. */
export function angles(t: Time) {
  return { hour: ((t.h % 12) + t.m / 60) * 30, minute: t.m * 6 }
}

/** Wrong answers that look tempting: hands swapped, an hour off, the minutes off by a step. */
export function makeOptions(rng: Rng, answer: Time, level: number): Time[] {
  const step = stepFor(level)
  const s = step === 60 ? 30 : step
  const tempting: Time[] = [
    { h: wrapH(answer.h + 1), m: answer.m },
    { h: wrapH(answer.h - 1), m: answer.m },
    { h: answer.h, m: (answer.m + s) % 60 },
    { h: answer.h, m: (answer.m + 60 - s) % 60 },
  ]
  // Swapped hands only make sense when the minute hand points at a number.
  if (answer.m % 5 === 0) tempting.push({ h: answer.m === 0 ? 12 : answer.m / 5, m: (answer.h % 12) * 5 })
  const options: Time[] = [answer]
  for (const o of rng.shuffle(tempting)) {
    if (options.length >= optionCount(level)) break
    // Keep wrong answers on the same grid as the level (whole hours, halves, quarters…).
    if (o.m % step !== 0) continue
    if (!options.some((x) => same(x, o))) options.push(o)
  }
  while (options.length < optionCount(level)) {
    const o = randomTime(rng, step)
    if (!options.some((x) => same(x, o))) options.push(o)
  }
  return rng.shuffle(options)
}

export function pointsFor(seconds: number, combo: number) {
  return 10 + clamp(Math.round((5 - seconds) * 3), 0, 12) + Math.min(combo, 8) * 2
}
