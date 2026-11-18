import { clamp, type Rng } from '../../kit/random'

/** Fireflies to catch in one stage. */
export const STAGE = 8

export interface Spec {
  /** Fireflies in the meadow at once. */
  count: number
  /** How long a firefly glows and how long it sleeps, in seconds. */
  glow: number
  dark: number
  /** How fast they drift, in % of the meadow per second. */
  speed: number
}

const SPECS: Spec[] = [
  { count: 3, glow: 2.6, dark: 1.6, speed: 1.5 },
  { count: 3, glow: 2.3, dark: 1.8, speed: 2 },
  { count: 4, glow: 2.0, dark: 1.9, speed: 2.5 },
  { count: 4, glow: 1.8, dark: 2.0, speed: 3 },
  { count: 4, glow: 1.6, dark: 2.1, speed: 3.5 },
  { count: 5, glow: 1.5, dark: 2.2, speed: 4 },
  { count: 5, glow: 1.3, dark: 2.3, speed: 4.5 },
  { count: 5, glow: 1.2, dark: 2.4, speed: 5 },
  { count: 6, glow: 1.1, dark: 2.5, speed: 5.5 },
  { count: 6, glow: 1.0, dark: 2.6, speed: 6 },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

/** Where fireflies may fly, in % of the meadow: clear of the edges and of the jar at the bottom. */
export const AREA = { left: 10, right: 90, top: 10, bottom: 66 }

export interface Fly {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  /** Where in its glow-and-sleep cycle the firefly starts, in seconds. */
  offset: number
}

/** A new firefly somewhere in the meadow, drifting in a random direction, starting asleep. */
export function spawn(rng: Rng, spec: Spec, id: number): Fly {
  const angle = rng.next() * Math.PI * 2
  return {
    id,
    x: rng.int(AREA.left, AREA.right),
    y: rng.int(AREA.top, AREA.bottom),
    dx: Math.cos(angle) * spec.speed,
    dy: Math.sin(angle) * spec.speed,
    // Start in the sleeping part, at a random point of it, so new fireflies light up one by one.
    offset: spec.glow + rng.next() * spec.dark,
  }
}

/** Whether a firefly glows `t` seconds after it appeared. */
export function glowing(fly: Fly, t: number, spec: Spec) {
  const cycle = spec.glow + spec.dark
  const at = (((t + fly.offset) % cycle) + cycle) % cycle
  return at < spec.glow
}

/** Moves a firefly `dt` seconds on, turning back at the edges of the area. */
export function drift(fly: Fly, dt: number): Fly {
  let { x, y, dx, dy } = fly
  x += dx * dt
  y += dy * dt
  if (x < AREA.left || x > AREA.right) {
    dx = -dx
    x = clamp(x, AREA.left, AREA.right)
  }
  if (y < AREA.top || y > AREA.bottom) {
    dy = -dy
    y = clamp(y, AREA.top, AREA.bottom)
  }
  return { ...fly, x, y, dx, dy }
}
