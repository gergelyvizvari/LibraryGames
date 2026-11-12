import { geoMercator } from 'd3-geo';
import { dotChoices as spreadDots, pointsForKm as scoreKm } from '../../kit/mapHunt';
import { SCALE, TRANSLATE } from './outline';
export { ROUNDS, dotCount, kmBetween, pickRound, placesFor, showDots } from '../../kit/mapHunt';
export const projection = geoMercator().scale(SCALE).translate(TRANSLATE);
export function toMap(at) {
    return projection(at) ?? [0, 0];
}
export function fromMap(xy) {
    return projection.invert?.(xy) ?? null;
}
/** Towns closer than this are never both dots. */
export const DOT_GAP_KM = 30;
export const BANDS = [20, 45, 80];
export const dotChoices = (rng, places, target, count) => spreadDots(rng, places, target, count, DOT_GAP_KM);
export const pointsForKm = (km) => scoreKm(km, BANDS);
