import { critterKinds, type CritterKind } from '../../kit/critters'
import { clamp, type Rng } from '../../kit/random'
import type { ThingId } from '../../kit/things'

/** Shadows to match in one stage. */
export const STAGE = 6

/** Shapes that look alike as a shadow belong to one group; hard levels pick the wrong answers from the same group. */
export type Group = 'critter' | 'round' | 'pointy' | 'other'

export type Shape = { kind: 'thing'; id: ThingId; group: Group } | { kind: 'critter'; id: CritterKind; group: Group }

const things: [ThingId, Group][] = [
  ['apple', 'round'], ['cookie', 'round'], ['ladybird', 'round'], ['berries', 'round'], ['flower', 'round'], ['balloon', 'round'],
  ['star', 'pointy'], ['pine', 'pointy'], ['leaf', 'pointy'], ['drop', 'pointy'], ['acorn', 'pointy'],
  ['mushroom', 'other'], ['moon', 'other'], ['fish', 'other'], ['heart', 'other'],
  // No snowball: its shadow is the same circle as the cookie's.
]

export const SHAPES: Shape[] = [
  ...things.map(([id, group]): Shape => ({ kind: 'thing', id, group })),
  ...critterKinds.map((id): Shape => ({ kind: 'critter', id, group: 'critter' })),
]

export const shapeKey = (s: Shape) => `${s.kind}:${s.id}`

const lv = (level: number) => clamp(Math.round(level), 1, 10)
export const choiceCount = (level: number) => (lv(level) <= 4 ? 3 : 4)

/** How the shadow is turned: never at first, mirrored from level 5, also lying on its side or upside down from level 7. */
export interface Turn {
  rotate: 0 | 90 | 180 | 270
  flip: boolean
}

export function turnFor(rng: Rng, level: number): Turn {
  const l = lv(level)
  if (l <= 4) return { rotate: 0, flip: false }
  if (l <= 6) return { rotate: 0, flip: rng.chance(0.5) }
  return { rotate: rng.pick([0, 90, 180, 270] as const), flip: rng.chance(0.5) }
}

export interface Task {
  target: Shape
  choices: Shape[]
  turn: Turn
}

/**
 * Deals the tasks: every shape is a shadow once before any comes back, never the same twice in a row.
 * The wrong answers are very different from the right one at levels 1 and 2, anything in the middle, and as
 * alike as possible (the same group) from level 7.
 */
export function makeDealer(rng: Rng, level: number, pool: Shape[] = SHAPES) {
  const l = lv(level)
  const n = Math.min(choiceCount(level), pool.length)
  let deck: Shape[] = []
  let last: Shape | null = null
  return (): Task => {
    if (deck.length === 0) {
      deck = rng.shuffle(pool)
      if (deck.length > 1 && deck[deck.length - 1] === last) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]]
    }
    const target = deck.pop()!
    last = target
    const others = rng.shuffle(pool.filter((s) => s !== target))
    const same = others.filter((s) => s.group === target.group)
    const different = others.filter((s) => s.group !== target.group)
    const order = l <= 2 ? [...different, ...same] : l >= 7 ? [...same, ...different] : others
    // At the easy levels no two wrong answers share a group either, so the row looks clearly mixed.
    const wrong: Shape[] = []
    if (l <= 2) for (const s of order) if (wrong.length < n - 1 && !wrong.some((w) => w.group === s.group)) wrong.push(s)
    for (const s of order) if (wrong.length < n - 1 && !wrong.includes(s)) wrong.push(s)
    return { target, choices: rng.shuffle([target, ...wrong]), turn: turnFor(rng, level) }
  }
}

/** The CSS transform that turns a shape the way its shadow falls. */
export const turnCss = (t: Turn) => `rotate(${t.rotate}deg)${t.flip ? ' scaleX(-1)' : ''}`
