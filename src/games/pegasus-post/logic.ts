import type { Rng } from '../../kit/random'

/**
 * Pegasus Post: clouds in the sky, a house on each. The pegasus flies from cloud to cloud (up, down, left or
 * right, never across a gap) and must bring a letter to every house, landing on every cloud exactly once.
 * On higher levels the round must end at the rainbow gate, which only opens when every letter is delivered.
 */
/** A cloud's place as row * cols + column. */
export type Cell = number

export interface Sky {
  cols: number
  rows: number
  /** Where there is a cloud. */
  clouds: boolean[]
  /** The post office cloud the pegasus starts from. */
  start: Cell
  /** The rainbow gate, where the round has to end; null when it may end anywhere. */
  home: Cell | null
  /** One whole round, from the start: the proof that the sky can be solved. */
  way: Cell[]
}

/** Skies in one stage. */
export const SKIES = 3

export interface Plan {
  cols: number
  rows: number
  /** Clouds, the start included. */
  clouds: number
  home: boolean
  /** At least this many steps of the round offer a wrong turn that ends in a dead end. */
  traps: number
}

const plans: Plan[] = [
  { cols: 3, rows: 3, clouds: 6, home: false, traps: 1 },
  { cols: 3, rows: 3, clouds: 8, home: false, traps: 1 },
  { cols: 4, rows: 3, clouds: 9, home: false, traps: 2 },
  { cols: 4, rows: 4, clouds: 11, home: false, traps: 2 },
  { cols: 4, rows: 4, clouds: 13, home: false, traps: 3 },
  { cols: 4, rows: 4, clouds: 12, home: true, traps: 3 },
  { cols: 5, rows: 4, clouds: 14, home: true, traps: 3 },
  { cols: 5, rows: 5, clouds: 16, home: true, traps: 4 },
  { cols: 5, rows: 5, clouds: 18, home: true, traps: 4 },
  { cols: 5, rows: 5, clouds: 20, home: true, traps: 5 },
]
export const planFor = (level: number) => plans[Math.min(plans.length, Math.max(1, Math.round(level))) - 1]

/** The clouds right next to `c`. */
export function neighbours(sky: Pick<Sky, 'cols' | 'rows' | 'clouds'>, c: Cell): Cell[] {
  const r = Math.floor(c / sky.cols)
  const k = c % sky.cols
  const out: Cell[] = []
  if (r > 0) out.push(c - sky.cols)
  if (k < sky.cols - 1) out.push(c + 1)
  if (r < sky.rows - 1) out.push(c + sky.cols)
  if (k > 0) out.push(c - 1)
  return out.filter((n) => sky.clouds[n])
}

export const cloudCount = (sky: Sky) => sky.clouds.filter(Boolean).length

/** The clouds the pegasus may fly to next: a neighbour it has not been on. The gate opens last. */
export function moves(sky: Sky, route: Cell[]): Cell[] {
  const here = route[route.length - 1]
  const lastOne = route.length === cloudCount(sky) - 1
  return neighbours(sky, here).filter((n) => !route.includes(n) && (n !== sky.home || lastOne))
}

export const finished = (sky: Sky, route: Cell[]) => route.length === cloudCount(sky)
/** Nowhere left to fly, and letters still in the bag. */
export const stuck = (sky: Sky, route: Cell[]) => !finished(sky, route) && moves(sky, route).length === 0

/** Why a tap on a cloud does nothing. */
export function refusal(sky: Sky, route: Cell[], c: Cell): 'far' | 'visited' | 'gate' | null {
  if (moves(sky, route).includes(c)) return null
  if (route.includes(c)) return 'visited'
  if (c === sky.home && neighbours(sky, route[route.length - 1]).includes(c)) return 'gate'
  return 'far'
}

/** The rest of a whole round from where the route stands, or null when there is none any more. */
export function finish(sky: Sky, route: Cell[]): Cell[] | null {
  const total = cloudCount(sky)
  const seen = new Set(route)
  const rest: Cell[] = []
  const free = (c: Cell, here: Cell) => neighbours(sky, c).filter((n) => !seen.has(n) || n === here).length
  const go = (here: Cell): boolean => {
    if (seen.size === total) return sky.home === null || here === sky.home
    // A cloud with one way in must be the last one, so two of them (or one that is not the gate) end the search.
    let ends = 0
    for (let c = 0; c < sky.clouds.length; c++) {
      if (!sky.clouds[c] || seen.has(c)) continue
      const f = free(c, here)
      if (f === 0) return false
      if (f === 1 && ++ends > 1) return false
      if (f === 1 && sky.home !== null && c !== sky.home) return false
    }
    for (const n of neighbours(sky, here)) {
      if (seen.has(n) || (n === sky.home && seen.size < total - 1)) continue
      seen.add(n)
      rest.push(n)
      if (go(n)) return true
      rest.pop()
      seen.delete(n)
    }
    return false
  }
  return go(route[route.length - 1]) ? rest : null
}

/** How many steps of the sky's own round offer a wrong turn: a cloud to fly to from which the round cannot be finished. */
export function trapCount(sky: Sky): number {
  let n = 0
  for (let i = 1; i < sky.way.length; i++) {
    const route = sky.way.slice(0, i)
    if (moves(sky, route).some((m) => m !== sky.way[i] && !finish(sky, [...route, m]))) n++
  }
  return n
}

/** A random walk over `len` squares that never crosses itself, found by trying and stepping back. */
function wander(rng: Rng, cols: number, rows: number, len: number): Cell[] | null {
  const all = { cols, rows, clouds: Array.from({ length: cols * rows }, () => true) }
  const path = [rng.int(0, cols * rows - 1)]
  const seen = new Set(path)
  let budget = 4000
  const go = (): boolean => {
    if (path.length === len) return true
    if (--budget < 0) return false
    for (const n of rng.shuffle(neighbours(all, path[path.length - 1]))) {
      if (seen.has(n)) continue
      seen.add(n)
      path.push(n)
      if (go()) return true
      path.pop()
      seen.delete(n)
    }
    return false
  }
  return go() ? path : null
}

export function makeSky(rng: Rng, level: number): Sky {
  const plan = planFor(level)
  let best: Sky | null = null
  let bestTraps = -1
  for (let attempt = 0; attempt < 60; attempt++) {
    const way = wander(rng, plan.cols, plan.rows, plan.clouds)
    if (!way) continue
    const clouds = Array.from({ length: plan.cols * plan.rows }, (_, c) => way.includes(c))
    const sky: Sky = { cols: plan.cols, rows: plan.rows, clouds, start: way[0], home: plan.home ? way[way.length - 1] : null, way }
    const traps = trapCount(sky)
    if (traps > bestTraps) {
      best = sky
      bestTraps = traps
    }
    if (traps >= plan.traps) break
  }
  return best!
}
