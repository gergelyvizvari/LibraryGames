import { kmBetween } from '../../kit/mapHunt';
import { features, names } from './content';
export const placesFor = (locale) => features.map((f) => ({ name: (names[locale] ?? names.en)[f.id], at: f.at, minLevel: f.minLevel, feature: f }));
/** Points as km on a flat patch around `lat0`: close enough over a few hundred km. */
const flat = ([lon, lat], lat0) => [lon * 111.32 * Math.cos((lat0 * Math.PI) / 180), lat * 110.57];
/** Distance in km from a point to a line segment. */
export function kmToSegment(p, a, b) {
    const lat0 = p[1];
    const [px, py] = flat(p, lat0);
    const [ax, ay] = flat(a, lat0);
    const [bx, by] = flat(b, lat0);
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy;
    const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
/** How far a tap is from a feature: from the nearest bit of a river or ridge, or from a single point. */
export function kmToFeature(f, tap) {
    if (!f.line || f.line.length < 2)
        return kmBetween(tap, f.at);
    let best = Infinity;
    for (let i = 1; i < f.line.length; i++)
        best = Math.min(best, kmToSegment(tap, f.line[i - 1], f.line[i]));
    return best;
}
/** Europe is big: a fingertip on a phone covers about 300 km. */
export const BANDS = [110, 230, 400];
/** Dots closer than this are never both shown. */
export const DOT_GAP_KM = 260;
const SEA_LABEL = { atlantic: 'ocean', biscay: 'bay', channel: 'channel' };
export function kindLabel(f) {
    if (f.kind === 'mountain')
        return f.line ? 'mountain' : 'peak';
    if (f.kind === 'sea')
        return SEA_LABEL[f.id] ?? 'sea';
    return f.kind;
}
