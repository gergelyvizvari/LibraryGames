import { geoNaturalEarth1, geoMercator, geoPath, type GeoProjection } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { feature } from 'topojson-client'
import type { Region } from './content'

export const WIDTH = 1000

// Each question zooms to the part of the world its country is in, so countries are big enough to tap on a phone.
const boxes: Record<Region, [[number, number], [number, number]]> = {
  americas: [[-168, -56], [-12, 72]],
  europe: [[-25, 35], [45, 70.5]],
  africa: [[-19, -36], [64, 38]],
  asia: [[26, -48], [179, 76]],
}

export interface RegionMap {
  height: number
  shapes: MapShape[]
}

export interface MapShape {
  name: string
  d: string
  bounds: [[number, number], [number, number]]
}

type Props = { name: string }
const cache = new Map<Region, RegionMap>()
let features: Feature<Geometry, Props>[] | null = null

async function loadFeatures() {
  if (features) return features
  // Loaded on demand so the map data (~100 KB) is only fetched when someone plays.
  const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Parameters<typeof feature>[0] & {
    objects: { countries: Parameters<typeof feature>[1] }
  }
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, Props>
  features = fc.features.filter((f) => f.properties.name !== 'Antarctica' && f.properties.name !== 'Fr. S. Antarctic Lands')
  return features
}

function boxFeature(region: Region): Feature {
  const [[x0, y0], [x1, y1]] = boxes[region]
  const points: [number, number][] = []
  for (let i = 0; i <= 8; i++) points.push([x0 + ((x1 - x0) * i) / 8, y0], [x0 + ((x1 - x0) * i) / 8, y1], [x0, y0 + ((y1 - y0) * i) / 8], [x1, y0 + ((y1 - y0) * i) / 8])
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: points } }
}

function projection(region: Region): GeoProjection {
  const [[x0], [x1]] = boxes[region]
  const base = region === 'europe' ? geoMercator() : geoNaturalEarth1().rotate([-(x0 + x1) / 2, 0])
  return base.fitWidth(WIDTH, boxFeature(region))
}

export async function loadMap(region: Region): Promise<RegionMap> {
  const cached = cache.get(region)
  if (cached) return cached
  const fs = await loadFeatures()
  const path = geoPath(projection(region))
  const [, [, bottom]] = path.bounds(boxFeature(region))
  const shapes = fs.map((f) => ({ name: f.properties.name, d: path(f) ?? '', bounds: path.bounds(f) }))
  const map = { height: Math.ceil(bottom), shapes }
  cache.set(region, map)
  return map
}

/** Small countries are hard to hit with a finger, so a tap close to them counts too. */
export function nearEnough(shape: MapShape, x: number, y: number, pad = 18) {
  const [[x0, y0], [x1, y1]] = shape.bounds
  if (x1 - x0 > 60 || y1 - y0 > 60) return false
  return x >= x0 - pad && x <= x1 + pad && y >= y0 - pad && y <= y1 + pad
}
