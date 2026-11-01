import { geoDistance } from 'd3-geo'
import { clamp, type Rng } from './random'

/** A place on a map hunt map. `minLevel` keeps small places for older kids. Coordinates are [longitude, latitude]. */
export interface MapPlace {
  name: string
  at: [number, number]
  minLevel: number
}

/** Distances in km that still score 30, 20 and 10 points. */
export type KmBands = [number, number, number]

export const ROUNDS = 10
const EARTH_KM = 6371

/** Up to level 3 the places show as dots and you pick one; after that the map is blind. */
export const showDots = (level: number) => level <= 3
/** How many dots are on the map when they are shown. */
export const dotCount = (level: number) => clamp(4 + level * 2, 6, 10)

export const placesFor = <P extends MapPlace>(places: P[], level: number) => places.filter((p) => p.minLevel <= level)

/** Ten different places for one round. */
export function pickRound<P extends MapPlace>(rng: Rng, places: P[], level: number) {
  return rng.shuffle([...placesFor(places, level)]).slice(0, ROUNDS)
}

/** The asked place plus other places as dot choices, at least `gapKm` apart so dots don't overlap. */
export function dotChoices<P extends MapPlace>(rng: Rng, places: P[], target: P, count: number, gapKm: number) {
  const chosen = [target]
  for (const p of rng.shuffle(places.filter((q) => q !== target))) {
    if (chosen.length >= count) break
    if (chosen.every((c) => kmBetween(c.at, p.at) > gapKm)) chosen.push(p)
  }
  return chosen
}

export function kmBetween(a: [number, number], b: [number, number]) {
  return geoDistance(a, b) * EARTH_KM
}

/** Points for a blind tap, by how far off it was. */
export function pointsForKm(km: number, [best, good, ok]: KmBands) {
  if (km <= best) return 30
  if (km <= good) return 20
  if (km <= ok) return 10
  return 0
}
