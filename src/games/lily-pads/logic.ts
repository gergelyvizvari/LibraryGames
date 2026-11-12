import { critterKinds, type CritterKind } from '../../kit/critters'
import { clamp, type Rng } from '../../kit/random'
import { thingIds, type ThingId } from '../../kit/things'

/** Pairs of lily pads in one stage. */
export const STAGE = 6

/** Pictures that look alike at a glance share a group; hard levels put look-alikes next to the shared picture. */
export type Group = 'red' | 'warm' | 'cool' | 'purple' | 'critter'

export type Pic = { kind: 'thing'; id: ThingId; group: Group } | { kind: 'critter'; id: CritterKind; group: Group }

const groups: Record<ThingId, Group> = {
  apple: 'red', heart: 'red', ladybird: 'red', mushroom: 'red',
  star: 'warm', cookie: 'warm', fish: 'warm', acorn: 'warm',
  drop: 'cool', balloon: 'cool', leaf: 'cool', pine: 'cool', snowball: 'cool',
  moon: 'purple', berries: 'purple', flower: 'purple',
}

export const PICS: Pic[] = [
  ...thingIds.map((id): Pic => ({ kind: 'thing', id, group: groups[id] })),
  ...critterKinds.map((id): Pic => ({ kind: 'critter', id, group: 'critter' })),
]

export const picKey = (p: Pic) => `${p.kind}:${p.id}`

const lv = (level: number) => clamp(Math.round(level), 1, 10)

/** Pictures on each pad: 3 at level 1, up to 7 at level 9. */
export const perPad = (level: number) => [3, 3, 4, 4, 5, 5, 6, 6, 7, 7][lv(level) - 1]

/** One picture as it lies on a pad: where (in pad radii from the centre), how big (in pad radii) and how turned. */
export interface Placed {
  pic: Pic
  x: number
  y: number
  size: number
  rotate: number
}

/** A pad: its pictures, and where its notch points (degrees, between two pictures so none lies on the water). */
export interface Pad {
  notch: number
  items: Placed[]
}

export interface Task {
  shared: Pic
  pads: [Pad, Pad]
}

/** Spots on a pad for n pictures: [distance from the centre, room around the spot], in pad radii. */
function spots(n: number): { d: number; r: number }[] {
  if (n <= 3) return Array.from({ length: n }, () => ({ d: 0.46, r: 0.36 }))
  if (n === 4) return Array.from({ length: 4 }, () => ({ d: 0.48, r: 0.31 }))
  const ring = n - 1
  const r = n === 5 ? 0.27 : n === 6 ? 0.25 : 0.23
  return [{ d: 0, r }, ...Array.from({ length: ring }, () => ({ d: 0.6, r }))]
}

/**
 * Lays pictures out on a pad without overlaps: an even ring (with one in the middle from 5 pictures), the whole
 * ring turned a random way. Sizes and turns vary only from level 5, so the easy levels look tidy.
 */
export function layPad(rng: Rng, pics: Pic[], level: number): Pad {
  const l = lv(level)
  const sp = spots(pics.length)
  const ringCount = sp.filter((s) => s.d > 0).length
  const offset = rng.next() * Math.PI * 2
  let k = 0
  const notch = Math.round(((offset + Math.PI / Math.max(ringCount, 1)) * 180) / Math.PI) % 360
  const items = pics.map((pic, i) => {
    const s = sp[i]
    const a = offset + (k * Math.PI * 2) / Math.max(ringCount, 1)
    if (s.d > 0) k++
    const scale = l <= 4 ? 1 : l <= 8 ? 0.85 + rng.next() * 0.15 : 0.72 + rng.next() * 0.28
    const rotate = l <= 4 ? 0 : l <= 6 ? Math.round((rng.next() - 0.5) * 70) : Math.round(rng.next() * 360)
    return { pic, x: Math.cos(a) * s.d, y: Math.sin(a) * s.d, size: s.r * 2 * scale, rotate }
  })
  return { notch, items }
}

/**
 * Deals the pairs of pads: exactly one picture is on both. Every picture is the shared one once before any comes
 * back, never twice in a row. From level 7 the shared picture's look-alikes are put on the pads too.
 */
export function makeDealer(rng: Rng, level: number, pool: Pic[] = PICS) {
  const l = lv(level)
  const n = perPad(level)
  let deck: Pic[] = []
  let last: Pic | null = null
  return (): Task => {
    if (deck.length === 0) {
      deck = rng.shuffle(pool)
      if (deck.length > 1 && deck[deck.length - 1] === last) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]]
    }
    const shared = deck.pop()!
    last = shared
    const others = rng.shuffle(pool.filter((p) => p !== shared))
    const order = l >= 7 ? [...others.filter((p) => p.group === shared.group), ...others.filter((p) => p.group !== shared.group)] : others
    // Look-alikes go to both pads in turn, so each pad gets its share.
    const rest = order.slice(0, (n - 1) * 2)
    const a = rest.filter((_, i) => i % 2 === 0)
    const b = rest.filter((_, i) => i % 2 === 1)
    return {
      shared,
      pads: [layPad(rng, rng.shuffle([shared, ...a]), level), layPad(rng, rng.shuffle([shared, ...b]), level)],
    }
  }
}
