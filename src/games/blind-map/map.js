import { geoNaturalEarth1, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
export const WIDTH = 1000;
// Each question zooms to the part of the world its country is in, so countries are big enough to tap on a phone.
const boxes = {
    americas: [[-168, -56], [-12, 72]],
    europe: [[-25, 35], [45, 70.5]],
    africa: [[-19, -36], [64, 38]],
    asia: [[26, -48], [179, 76]],
};
const cache = new Map();
let features = null;
async function loadFeatures() {
    if (features)
        return features;
    // Loaded on demand so the map data (~100 KB) is only fetched when someone plays.
    const topo = (await import('world-atlas/countries-110m.json')).default;
    const fc = feature(topo, topo.objects.countries);
    features = fc.features.filter((f) => f.properties.name !== 'Antarctica' && f.properties.name !== 'Fr. S. Antarctic Lands');
    return features;
}
function boxFeature(region) {
    const [[x0, y0], [x1, y1]] = boxes[region];
    const points = [];
    for (let i = 0; i <= 8; i++)
        points.push([x0 + ((x1 - x0) * i) / 8, y0], [x0 + ((x1 - x0) * i) / 8, y1], [x0, y0 + ((y1 - y0) * i) / 8], [x1, y0 + ((y1 - y0) * i) / 8]);
    return { type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: points } };
}
function projection(region) {
    const [[x0], [x1]] = boxes[region];
    const base = region === 'europe' ? geoMercator() : geoNaturalEarth1().rotate([-(x0 + x1) / 2, 0]);
    return base.fitWidth(WIDTH, boxFeature(region));
}
export async function loadMap(region) {
    const cached = cache.get(region);
    if (cached)
        return cached;
    const fs = await loadFeatures();
    const path = geoPath(projection(region));
    const [, [, bottom]] = path.bounds(boxFeature(region));
    const shapes = fs.map((f) => ({ name: f.properties.name, d: path(f) ?? '', bounds: path.bounds(f) }));
    const map = { height: Math.ceil(bottom), shapes };
    cache.set(region, map);
    return map;
}
/** Small countries are hard to hit with a finger, so a tap close to them counts too. */
export function nearEnough(shape, x, y, pad = 18) {
    const [[x0, y0], [x1, y1]] = shape.bounds;
    if (x1 - x0 > 60 || y1 - y0 > 60)
        return false;
    return x >= x0 - pad && x <= x1 + pad && y >= y0 - pad && y <= y1 + pad;
}
