import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { CONTINENTS, URALS, classify } from './continents';
export const WIDTH = 1000;
const anchorsLonLat = {
    northAmerica: [-102, 46],
    southAmerica: [-60, -14],
    europe: [18, 52],
    africa: [20, 6],
    asia: [92, 48],
    oceania: [134, -25],
    antarctica: [20, -78],
};
let cached = null;
export async function loadWorld() {
    if (cached)
        return cached;
    // Loaded on demand so the map data (~100 KB) is only fetched when someone plays.
    const topo = (await import('world-atlas/countries-110m.json')).default;
    const fc = feature(topo, topo.objects.countries);
    const parts = Object.fromEntries(CONTINENTS.map((c) => [c, []]));
    let russia = [];
    for (const f of fc.features) {
        if (f.properties.name === 'Fr. S. Antarctic Lands')
            continue;
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        // Mainland Russia (its biggest piece) is split at the Urals by clipping, every other piece is sorted by its centre.
        const mainland = f.properties.name === 'Russia' ? polys.reduce((a, b) => (b[0].length > a[0].length ? b : a)) : null;
        for (const p of polys) {
            if (p === mainland) {
                russia = p;
                continue;
            }
            const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: p });
            parts[classify(lon, lat, f.properties.name)].push(p);
        }
    }
    // Fit the land, not the whole globe, so the continents are as big as the phone allows.
    const all = {
        type: 'FeatureCollection',
        features: [...CONTINENTS.flatMap((c) => parts[c]), russia].map((coordinates) => ({
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates },
        })),
    };
    const projection = geoNaturalEarth1().rotate([-10, 0]).fitWidth(WIDTH - 12, all);
    const [[bx, by], [, bottom]] = geoPath(projection).bounds(all);
    const [tx, ty] = projection.translate();
    projection.translate([tx - bx + 6, ty - by + 6]);
    const path = geoPath(projection);
    const height = Math.ceil(bottom - by + 12);
    const land = Object.fromEntries(CONTINENTS.map((c) => [c, path({ type: 'MultiPolygon', coordinates: parts[c] }) ?? '']));
    const meridian = Array.from({ length: 37 }, (_, i) => projection([URALS, 90 - i * 5]));
    const line = meridian.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
    const west = `M0,0 L${line} L0,${height} Z`;
    const east = `M${WIDTH},0 L${line} L${WIDTH},${height} Z`;
    const anchors = Object.fromEntries(CONTINENTS.map((c) => [c, projection(anchorsLonLat[c])]));
    const r = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: russia } };
    cached = { height, land, russia: russia.length ? (path(r) ?? '') : '', west, east, anchors };
    return cached;
}
