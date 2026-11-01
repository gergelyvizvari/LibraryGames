import { geoMercator } from 'd3-geo'
import { dotChoices as spreadDots, pointsForKm as scoreKm, type KmBands, type MapPlace } from '../../kit/mapHunt'
import type { Rng } from '../../kit/random'
import { SCALE, TRANSLATE } from './outline'

export { ROUNDS, dotCount, kmBetween, pickRound, placesFor, showDots } from '../../kit/mapHunt'

export const projection = geoMercator().scale(SCALE).translate(TRANSLATE)

export function toMap(at: [number, number]): [number, number] {
  return projection(at) ?? [0, 0]
}

export function fromMap(xy: [number, number]): [number, number] | null {
  return (projection.invert?.(xy) as [number, number] | null | undefined) ?? null
}

/** Towns closer than this are never both dots. */
export const DOT_GAP_KM = 30
export const BANDS: KmBands = [20, 45, 80]

export const dotChoices = <P extends MapPlace>(rng: Rng, places: P[], target: P, count: number) =>
  spreadDots(rng, places, target, count, DOT_GAP_KM)

export const pointsForKm = (km: number) => scoreKm(km, BANDS)
