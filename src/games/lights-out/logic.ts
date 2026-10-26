import { clamp } from '../../kit/random'

export const ROUNDS = 5

export function pointsFor(ms: number) {
  return Math.max(0, Math.round(1000 - ms))
}

export function animalKey(ms: number) {
  if (ms < 260) return 'cheetah'
  if (ms < 360) return 'rabbit'
  if (ms < 500) return 'cat'
  return 'turtle'
}

/** 300 ms average or faster is a perfect round, 700 ms or slower counts as weak. */
export function accuracyFor(times: number[]) {
  if (times.length === 0) return 0
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return clamp((700 - avg) / 400, 0, 1)
}

/** Higher levels make the wait less predictable. */
export function holdRange(level: number): [number, number] {
  return [400, 1400 + level * 200]
}
