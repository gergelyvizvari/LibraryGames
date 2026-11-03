import { geoDistance } from 'd3-geo';
import { clamp } from './random';
export const ROUNDS = 10;
const EARTH_KM = 6371;
/** Up to level 3 the places show as dots and you pick one; after that the map is blind. */
export const showDots = (level) => level <= 3;
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
