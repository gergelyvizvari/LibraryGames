import { geoDistance, geoMercator } from 'd3-geo'
import { clamp, type Rng } from '../../kit/random'
import type { Place } from './content'
import { SCALE, TRANSLATE } from './outline'

export const ROUNDS = 10
const EARTH_KM = 6371

export const projection = geoMercator().scale(SCALE).translate(TRANSLATE)

export function toMap(at: [number, number]): [number, number] {
  return projection(at) ?? [0, 0]
}

/** Up to level 3 the towns show as dots and you pick one; after that the map is blind. */
export const showDots = (level: number) => level <= 3
/** How many dots are on the map when they are shown. */
export const dotCount = (level: number) => clamp(4 + level * 2, 6, 10)

export const placesFor = (places: Place[], level: number) => places.filter((p) => p.minLevel <= level)

/** Ten different places for one round. */
export function pickRound(rng: Rng, places: Place[], level: number) {
  return rng.shuffle([...placesFor(places, level)]).slice(0, ROUNDS)
}

/** The asked place plus other towns as dot choices, nearest-first spread so dots don't overlap. */
export function dotChoices(rng: Rng, places: Place[], target: Place, count: number) {
  const chosen = [target]
  for (const p of rng.shuffle(places.filter((q) => q !== target))) {
    if (chosen.length >= count) break
    if (chosen.every((c) => kmBetween(c.at, p.at) > 30)) chosen.push(p)
  }
  return chosen
}

export function kmBetween(a: [number, number], b: [number, number]) {
  return geoDistance(a, b) * EARTH_KM
}

/** Points for a blind tap, by how far off it was. */
export function pointsForKm(km: number) {
  if (km <= 20) return 30
  if (km <= 45) return 20
  if (km <= 80) return 10
  return 0
}
