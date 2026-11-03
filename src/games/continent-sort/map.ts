import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import { feature } from 'topojson-client'
import { CONTINENTS, URALS, classify, type Continent } from './continents'

export const WIDTH = 1000

export interface WorldMap {
  height: number
  /** One SVG path per continent. */
  land: Record<Continent, string>
  /** Mainland Russia, drawn twice and clipped at the Urals so its two halves land on the right continents. */
  russia: string
  /** Clip polygons west and east of the Urals. */
  west: string
  east: string
  /** Where to put each continent's name and the stickers kids have sorted. */
  anchors: Record<Continent, [number, number]>
}

const anchorsLonLat: Record<Continent, [number, number]> = {
  northAmerica: [-102, 46],
  southAmerica: [-60, -14],
  europe: [18, 52],
  africa: [20, 6],
  asia: [92, 48],
  oceania: [134, -25],
  antarctica: [20, -78],
}

let cached: WorldMap | null = null

export async function loadWorld(): Promise<WorldMap> {
  if (cached) return cached
  // Loaded on demand so the map data (~100 KB) is only fetched when someone plays.
  const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Parameters<typeof feature>[0] & {
    objects: { countries: Parameters<typeof feature>[1] }
  }
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Polygon | MultiPolygon, { name: string }>
  const parts: Record<Continent, Position[][][]> = Object.fromEntries(CONTINENTS.map((c) => [c, []])) as never
  let russia: Position[][] = []
  for (const f of fc.features) {
    if (f.properties.name === 'Fr. S. Antarctic Lands') continue
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    // Mainland Russia (its biggest piece) is split at the Urals by clipping, every other piece is sorted by its centre.
    const mainland = f.properties.name === 'Russia' ? polys.reduce((a, b) => (b[0].length > a[0].length ? b : a)) : null
    for (const p of polys) {
      if (p === mainland) {
        russia = p
        continue
      }
      const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: p })
      parts[classify(lon, lat, f.properties.name)].push(p)
    }
  }
  // Fit the land, not the whole globe, so the continents are as big as the phone allows.
  const all: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: [...CONTINENTS.flatMap((c) => parts[c]), russia].map((coordinates) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates },
    })),
  }
  const projection = geoNaturalEarth1().rotate([-10, 0]).fitWidth(WIDTH - 12, all)
  const [[bx, by], [, bottom]] = geoPath(projection).bounds(all)
  const [tx, ty] = projection.translate()
  projection.translate([tx - bx + 6, ty - by + 6])
  const path = geoPath(projection)
  const height = Math.ceil(bottom - by + 12)
  const land = Object.fromEntries(
    CONTINENTS.map((c) => [c, path({ type: 'MultiPolygon', coordinates: parts[c] } as MultiPolygon) ?? '']),
  ) as Record<Continent, string>
  const meridian = Array.from({ length: 37 }, (_, i) => projection([URALS, 90 - i * 5])!)
  const line = meridian.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
  const west = `M0,0 L${line} L0,${height} Z`
  const east = `M${WIDTH},0 L${line} L${WIDTH},${height} Z`
  const anchors = Object.fromEntries(CONTINENTS.map((c) => [c, projection(anchorsLonLat[c])!])) as WorldMap['anchors']
  const r: Feature<Polygon> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: russia } }
  cached = { height, land, russia: russia.length ? (path(r) ?? '') : '', west, east, anchors }
  return cached
}
