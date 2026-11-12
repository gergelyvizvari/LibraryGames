import { geoDistance } from 'd3-geo';
import { clamp } from './random';
export const ROUNDS = 10;
const EARTH_KM = 6371;
/** Up to level 3 the places show as dots and you pick one; after that the map is blind. */
export const showDots = (level) => level <= 3;
/** Dot size and its touch circle, in map units on a 1000-wide map: about 14 px and 42 px across on a phone. */
export const DOT_R = 20;
export const DOT_HIT_R = 60;
/** On the first two levels dots sit further apart, so small fingers don't hit the wrong one. */
export const dotGapFor = (level, gapKm) => (level <= 2 ? gapKm * 1.6 : gapKm);
/** The dot nearest to a tap, if the tap is within its touch circle; -1 if none is. */
export function nearestDot(dots, [x, y], hitR = DOT_HIT_R) {
    let best = -1;
    let bestD = hitR;
    dots.forEach(([dx, dy], i) => {
        const d = Math.hypot(dx - x, dy - y);
        if (d <= bestD) {
            best = i;
            bestD = d;
        }
    });
    return best;
}
/** How many dots are on the map when they are shown. */
export const dotCount = (level) => clamp(4 + level * 2, 6, 10);
export const placesFor = (places, level) => places.filter((p) => p.minLevel <= level);
/** Ten different places for one round. */
export function pickRound(rng, places, level) {
    return rng.shuffle([...placesFor(places, level)]).slice(0, ROUNDS);
}
/** The asked place plus other places as dot choices, at least `gapKm` apart so dots don't overlap. */
export function dotChoices(rng, places, target, count, gapKm) {
    const chosen = [target];
    for (const p of rng.shuffle(places.filter((q) => q !== target))) {
        if (chosen.length >= count)
            break;
        if (chosen.every((c) => kmBetween(c.at, p.at) > gapKm))
            chosen.push(p);
    }
    return chosen;
}
export function kmBetween(a, b) {
    return geoDistance(a, b) * EARTH_KM;
}
/** Points for a blind tap, by how far off it was. */
export function pointsForKm(km, [best, good, ok]) {
    if (km <= best)
        return 30;
    if (km <= good)
        return 20;
    if (km <= ok)
        return 10;
    return 0;
}
