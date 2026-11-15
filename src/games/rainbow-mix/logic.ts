import type { Rng } from '../../kit/random'

/**
 * Rainbow Mix: a pony wishes for a mane colour, and the player mixes it from drops of red, yellow, blue and
 * white paint. Paint mixes the way a paint box does: red and yellow give orange, yellow and blue give green,
 * red and blue give purple, all three give brown, and white makes a colour paler. Only the proportions count:
 * two drops of yellow with one of blue is a yellower green than one of each.
 */
export const PAINTS = ['red', 'yellow', 'blue', 'white'] as const
export type Paint = (typeof PAINTS)[number]

/** Ponies in one stage. */
export const wishesFor = (level: number) => (level >= 8 ? 5 : 4)

type Rgb = [number, number, number]
const WHITE: Rgb = [255, 250, 242]
// The corners of the paint box: the three paints, what two of them give in equal parts, and all three together.
const corner: Record<string, Rgb> = {
  '100': [232, 80, 91],
  '010': [247, 207, 69],
  '001': [59, 111, 216],
  '110': [245, 138, 60],
  '011': [79, 174, 98],
  '101': [142, 85, 196],
  '111': [138, 90, 60],
}
corner['000'] = WHITE

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/** How many drops of each paint are in a mix, in the order of PAINTS. */
export function counts(mix: readonly Paint[]): number[] {
  return PAINTS.map((p) => mix.filter((m) => m === p).length)
}

/** The proportions of a mix, so that mixes of the same colour get the same key ("1:1:0:0" for orange). */
export function ratio(mix: readonly Paint[]): string {
  const n = counts(mix)
  const d = n.reduce(gcd, 0) || 1
  return n.map((x) => x / d).join(':')
}

export const sameColour = (a: readonly Paint[], b: readonly Paint[]) => ratio(a) === ratio(b)

/** The colour of a mix as [red, green, blue] light, each 0 to 255. */
export function mixRgb(mix: readonly Paint[]): Rgb {
  const [r, y, b, w] = counts(mix)
  const most = Math.max(r, y, b)
  if (!most) return WHITE
  const at = [r / most, y / most, b / most]
  // Between the corners of the paint box, every part of the way counts (trilinear).
  const out: Rgb = [0, 0, 0]
  for (let i = 0; i < 8; i++) {
    const bits = [(i >> 2) & 1, (i >> 1) & 1, i & 1]
    const weight = bits.reduce((acc, bit, k) => acc * (bit ? at[k] : 1 - at[k]), 1)
    const c = corner[bits.join('')]
    for (let k = 0; k < 3; k++) out[k] += weight * c[k]
  }
  // White paint makes it paler.
  const pale = Math.min(0.85, (w / mix.length) * 1.1)
  return out.map((v, k) => Math.round(v + (WHITE[k] - v) * pale)) as Rgb
}

const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
export const mixColour = (mix: readonly Paint[]) => hex(mixRgb(mix))
/** A colour moved towards white (amount above 0) or towards the dark ink (below 0). */
export function tint(colour: string, amount: number): string {
  const c = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16))
  const to = amount > 0 ? [255, 255, 255] : [51, 40, 74]
  return hex(c.map((v, k) => Math.round(v + (to[k] - v) * Math.abs(amount))) as Rgb)
}

export interface Shade {
  /** Key of its name in strings.ts. */
  id: string
  recipe: Paint[]
  /** The level it first shows up at. */
  from: number
}

const R: Paint = 'red'
const Y: Paint = 'yellow'
const B: Paint = 'blue'
const W: Paint = 'white'

export const SHADES: Shade[] = [
  { id: 'orange', recipe: [R, Y], from: 1 },
  { id: 'green', recipe: [Y, B], from: 1 },
  { id: 'purple', recipe: [R, B], from: 1 },
  { id: 'pink', recipe: [R, W], from: 1 },
  { id: 'lightBlue', recipe: [B, W], from: 1 },
  { id: 'peach', recipe: [R, Y, W], from: 2 },
  { id: 'mint', recipe: [Y, B, W], from: 2 },
  { id: 'lilac', recipe: [R, B, W], from: 2 },
  { id: 'brown', recipe: [R, Y, B], from: 2 },
  { id: 'redOrange', recipe: [R, R, Y], from: 3 },
  { id: 'yellowOrange', recipe: [R, Y, Y], from: 3 },
  { id: 'yellowGreen', recipe: [Y, Y, B], from: 3 },
  { id: 'blueGreen', recipe: [Y, B, B], from: 4 },
  { id: 'blueViolet', recipe: [R, B, B], from: 4 },
  { id: 'redViolet', recipe: [R, R, B], from: 4 },
  { id: 'deepPink', recipe: [R, R, W], from: 5 },
  { id: 'palePink', recipe: [R, W, W], from: 5 },
  { id: 'paleBlue', recipe: [B, W, W], from: 5 },
  { id: 'skyBlue', recipe: [B, B, W], from: 5 },
]

/**
 * How many drops fit in the bowl. Never more than three: with four, three drops of one paint to one of another
 * would look almost like two to one, and telling them apart would be guessing.
 */
export const capFor = (level: number) => (level <= 1 ? 2 : 3)
/** Up to this level the pony says the colour's name; after it, it only shows the colour. */
export const namedAt = (level: number) => level <= 5

/** The wishes of one stage: all different, and at least half of them from the newest colours of the level. */
export function makeWishes(rng: Rng, level: number, n = wishesFor(level)): Shade[] {
  const open = SHADES.filter((s) => s.from <= level)
  const newest = Math.max(...open.map((s) => s.from))
  // High levels leave the easy colours behind: first the two-drop ones, then the equal mixes as well.
  const pool = level >= 9 ? open.filter((s) => s.from > 2) : level >= 7 ? open.filter((s) => s.from > 1) : open
  const fresh = rng.shuffle(pool.filter((s) => s.from >= newest - 1))
  const picked = fresh.slice(0, Math.ceil(n / 2))
  const rest = rng.shuffle(pool.filter((s) => !picked.includes(s)))
  return rng.shuffle([...picked, ...rest.slice(0, n - picked.length)])
}

/**
 * A tip after a wrong mix: a paint the wish needs and the mix lacks, a paint that does not belong, or (when
 * the paints are right) that the amounts are not.
 */
export function tip(wish: readonly Paint[], mix: readonly Paint[]): { kind: 'add' | 'drop'; paint: Paint } | { kind: 'amounts' } {
  const add = PAINTS.find((p) => wish.includes(p) && !mix.includes(p))
  if (add) return { kind: 'add', paint: add }
  const drop = PAINTS.find((p) => mix.includes(p) && !wish.includes(p))
  if (drop) return { kind: 'drop', paint: drop }
  return { kind: 'amounts' }
}
