import { geoAzimuthalEqualArea, geoPath, type GeoProjection } from 'd3-geo'
import type { FeatureCollection, Geometry, MultiPoint } from 'geojson'
import { feature } from 'topojson-client'

export const WIDTH = 1000

// Europe from Ireland to the Black Sea and from Sicily to the North Cape, in the equal-area view European atlases use.
// The Urals and the Caspian are left off so the rest is big enough to tap on a phone.
const box: MultiPoint = {
  type: 'MultiPoint',
  coordinates: [[-11, 36], [-11, 60], [5, 70.5], [26, 71.2], [42, 66], [43, 41], [30, 35.2], [10, 35.5], [-6, 35.5]],
}

export const projection: GeoProjection = geoAzimuthalEqualArea().rotate([-15, -53]).fitWidth(WIDTH, box)
const path = geoPath(projection)
export const HEIGHT = Math.ceil(path.bounds(box)[1][1])

export const toMap = (at: [number, number]): [number, number] => projection(at) ?? [0, 0]
export const fromMap = (xy: [number, number]) => (projection.invert?.(xy) as [number, number] | null | undefined) ?? null
export const linePath = (line: [number, number][]) => path({ type: 'LineString', coordinates: line }) ?? ''

let cached: string[] | null = null

/** Country outlines, loaded on demand so the map data (~100 KB) is only fetched when someone plays. */
export async function loadLand(): Promise<string[]> {
  if (cached) return cached
  const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Parameters<typeof feature>[0] & {
    objects: { countries: Parameters<typeof feature>[1] }
  }
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>
  cached = fc.features.map((f) => path(f) ?? '').filter(Boolean)
  return cached
}
