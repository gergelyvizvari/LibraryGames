import { geoMercator } from 'd3-geo';
import { INSET, SCALE, SHETLAND_SHIFT, TRANSLATE } from './outline';
export const projection = geoMercator().scale(SCALE).translate(TRANSLATE);
/** Shetland is north of this latitude; it is drawn in the inset box. */
const SHETLAND_LAT = 59.45;
const inInset = ([x, y]) => {
    const [ix, iy, w, h] = INSET;
    return x >= ix && x <= ix + w && y >= iy && y <= iy + h;
};
export function toMap(at) {
    const [x, y] = projection(at) ?? [0, 0];
    return at[1] > SHETLAND_LAT ? [x, y + SHETLAND_SHIFT] : [x, y];
}
export function fromMap(xy) {
    const [x, y] = inInset(xy) ? [xy[0], xy[1] - SHETLAND_SHIFT] : xy;
    return projection.invert?.([x, y]) ?? null;
}
/** Places closer than this are never both dots. The UK map is about twice as far across as Hungary's. */
export const DOT_GAP_KM = 40;
export const BANDS = [25, 55, 100];
