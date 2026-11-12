import { geoAzimuthalEqualArea, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
export const WIDTH = 1000;
// Europe from Ireland to the Black Sea and from Sicily to the North Cape, in the equal-area view European atlases use.
// The Urals and the Caspian are left off so the rest is big enough to tap on a phone.
const box = {
    type: 'MultiPoint',
    coordinates: [[-11, 36], [-11, 60], [5, 70.5], [26, 71.2], [42, 66], [43, 41], [30, 35.2], [10, 35.5], [-6, 35.5]],
};
export const projection = geoAzimuthalEqualArea().rotate([-15, -53]).fitWidth(WIDTH, box);
const path = geoPath(projection);
export const HEIGHT = Math.ceil(path.bounds(box)[1][1]);
export const toMap = (at) => projection(at) ?? [0, 0];
export const fromMap = (xy) => projection.invert?.(xy) ?? null;
export const linePath = (line) => path({ type: 'LineString', coordinates: line }) ?? '';
let cached = null;
/** Country outlines, loaded on demand so the map data (~100 KB) is only fetched when someone plays. */
export async function loadLand() {
    if (cached)
        return cached;
    const topo = (await import('world-atlas/countries-110m.json')).default;
    const fc = feature(topo, topo.objects.countries);
    cached = fc.features.map((f) => path(f) ?? '').filter(Boolean);
    return cached;
}
