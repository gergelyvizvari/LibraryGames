import { geoMercator } from 'd3-geo'
import type { KmBands } from '../../kit/mapHunt'
import { INSET, SCALE, SHETLAND_SHIFT, TRANSLATE } from './outline'

export const projection = geoMercator().scale(SCALE).translate(TRANSLATE)

/** Shetland is north of this latitude; it is drawn in the inset box. */
const SHETLAND_LAT = 59.45

const inInset = ([x, y]: [number, number]) => {
  const [ix, iy, w, h] = INSET
  return x >= ix && x <= ix + w && y >= iy && y <= iy + h
}

export function toMap(at: [number, number]): [number, number] {
  const [x, y] = projection(at) ?? [0, 0]
  return at[1] > SHETLAND_LAT ? [x, y + SHETLAND_SHIFT] : [x, y]
}

export function fromMap(xy: [number, number]): [number, number] | null {
  const [x, y] = inInset(xy) ? [xy[0], xy[1] - SHETLAND_SHIFT] : xy
  return (projection.invert?.([x, y]) as [number, number] | null | undefined) ?? null
}

/** Places closer than this are never both dots. The UK map is about twice as far across as Hungary's. */
export const DOT_GAP_KM = 40
export const BANDS: KmBands = [25, 55, 100]
