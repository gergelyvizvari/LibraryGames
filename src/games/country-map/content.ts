import type { Locale } from '../../i18n'
import type { MapPlace } from '../../kit/mapHunt'

/** A town on the map. `minLevel` keeps small towns for older kids. Coordinates are [longitude, latitude]. */
export type Place = MapPlace

const p = (name: string, lon: number, lat: number, minLevel = 1): Place => ({ name, at: [lon, lat], minLevel })

// Place names are the same in both languages; only the lake's label differs.
const towns: Place[] = [
  p('Budapest', 19.04, 47.5),
  p('Debrecen', 21.63, 47.53),
  p('Szeged', 20.15, 46.25),
  p('Miskolc', 20.78, 48.1),
  p('Pécs', 18.23, 46.07),
  p('Győr', 17.63, 47.69),
  p('Nyíregyháza', 21.72, 47.96),
  p('Kecskemét', 19.69, 46.91),
  p('Székesfehérvár', 18.41, 47.19),
  p('Szombathely', 16.62, 47.23),
  p('Szolnok', 20.18, 47.17),
  p('Sopron', 16.58, 47.68),
  p('Eger', 20.38, 47.9),
  p('Veszprém', 17.91, 47.09),
  p('Kaposvár', 17.8, 46.36),
  p('Békéscsaba', 21.09, 46.68),
  p('Zalaegerszeg', 16.84, 46.84),
  p('Siófok', 18.06, 46.9),
  p('Esztergom', 18.74, 47.79),
  p('Tokaj', 21.41, 48.12),
  p('Tatabánya', 18.39, 47.58, 3),
  p('Salgótarján', 19.8, 48.1, 3),
  p('Szekszárd', 18.7, 46.35, 3),
  p('Baja', 18.95, 46.18, 3),
  p('Keszthely', 17.25, 46.77, 3),
  p('Hódmezővásárhely', 20.33, 46.42, 5),
  p('Dunaújváros', 18.94, 46.96, 5),
  p('Nagykanizsa', 16.99, 46.45, 5),
  p('Gödöllő', 19.36, 47.6, 5),
  p('Visegrád', 18.97, 47.79, 5),
  p('Mohács', 18.68, 45.99, 7),
  p('Kalocsa', 18.98, 46.53, 7),
  p('Tihany', 17.89, 46.91, 7),
  p('Hortobágy', 21.15, 47.58, 7),
  p('Gyula', 21.28, 46.65, 7),
]

export const places: Record<Locale, Place[]> = { en: towns, hu: towns }

/** Rivers and Lake Balaton, drawn as hints on the blind map. [longitude, latitude] points. */
export const danube: [number, number][] = [
  [17.16, 48.01], [17.65, 47.76], [18.12, 47.75], [18.75, 47.81], [18.97, 47.8], [19.13, 47.77], [19.06, 47.6],
  [19.05, 47.5], [18.98, 47.3], [18.94, 46.96], [18.86, 46.62], [18.95, 46.36], [18.93, 46.17], [18.7, 45.99], [18.85, 45.85],
]
export const tisza: [number, number][] = [
  [22.8, 48.1], [22.35, 48.2], [21.85, 48.33], [21.42, 48.12], [21.0, 47.9], [20.75, 47.62], [20.42, 47.42],
  [20.18, 47.17], [20.1, 46.9], [20.15, 46.7], [20.13, 46.45], [20.15, 46.25], [20.1, 46.15],
]
export const balaton: [number, number][] = [
  [17.25, 46.72], [17.42, 46.74], [17.62, 46.81], [17.8, 46.88], [17.95, 46.93], [18.08, 46.98], [18.17, 47.03],
]
