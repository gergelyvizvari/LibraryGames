import type { Rng } from '../../kit/random'

/**
 * Rainbow Bridge: a row of stepping stones between two clouds. The stones must follow the order of the rainbow
 * (red, orange, yellow, green, blue, indigo, violet). Some stones are already there; the rest wait in the tray
 * among stones that do not belong. Higher levels hide the rainbow garland, leave more gaps, add trap stones and
 * sometimes lay the bridge the other way round (violet first).
 */
export const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'] as const
export type Rainbow = (typeof RAINBOW)[number]
/** Colours that are not one of the rainbow's seven: always traps. */
export const EXTRAS = ['pink', 'brown', 'grey', 'white', 'turquoise'] as const
export type StoneColour = Rainbow | (typeof EXTRAS)[number]

/** Bridges in one stage. */
export const BRIDGES = 3

export interface Plan {
  /** Stones in the bridge. */
  len: number
  /** Stones the player has to lay. */
  gaps: number
  /** Stones in the tray that do not belong. */
  traps: number
  /** The garland with the rainbow's order: always there, behind a cloud until asked for, or gone. */
  help: 'shown' | 'peek' | 'none'
  /** The bridge may run from violet to red. */
  canReverse: boolean
}

const plans: Plan[] = [
  { len: 5, gaps: 3, traps: 2, help: 'shown', canReverse: false },
  { len: 6, gaps: 4, traps: 2, help: 'shown', canReverse: false },
  { len: 6, gaps: 4, traps: 2, help: 'peek', canReverse: false },
  { len: 7, gaps: 5, traps: 2, help: 'peek', canReverse: false },
  { len: 7, gaps: 5, traps: 3, help: 'peek', canReverse: true },
  { len: 6, gaps: 4, traps: 3, help: 'peek', canReverse: true },
  { len: 7, gaps: 5, traps: 3, help: 'none', canReverse: false },
  { len: 6, gaps: 4, traps: 4, help: 'none', canReverse: true },
  { len: 7, gaps: 5, traps: 4, help: 'none', canReverse: true },
  { len: 7, gaps: 5, traps: 4, help: 'none', canReverse: true },
]
export const planFor = (level: number) => plans[Math.min(plans.length, Math.max(1, Math.round(level))) - 1]

export interface Bridge {
  /** The right colour of every stone, from left to right. */
  answer: Rainbow[]
  /** The stones that are already there. */
  fixed: boolean[]
  /** The loose stones, shuffled: the missing ones and the traps. */
  tray: StoneColour[]
  /** The bridge runs from violet towards red. */
  reversed: boolean
}

export function makeBridge(rng: Rng, level: number): Bridge {
  const { len, gaps, traps, canReverse } = planFor(level)
  const first = rng.int(0, RAINBOW.length - len)
  const reversed = canReverse && rng.chance(0.5)
  const run = RAINBOW.slice(first, first + len)
  const answer = reversed ? [...run].reverse() : run
  const open = new Set(rng.shuffle(answer.map((_, i) => i)).slice(0, gaps))
  const fixed = answer.map((_, i) => !open.has(i))
  const missing = answer.filter((_, i) => open.has(i))
  // Traps: colours that are no rainbow colours at all; from level 2 also rainbow colours that are not part of
  // this bridge, and second copies of stones that are already laid.
  const outside = RAINBOW.filter((c) => !run.includes(c))
  const copies = answer.filter((_, i) => fixed[i])
  const pool: StoneColour[] = level <= 1 ? ['pink', 'brown', 'grey', 'white'] : [...rng.shuffle([...outside, ...copies]).slice(0, 2), ...rng.shuffle(EXTRAS).slice(0, 3)]
  const tray = rng.shuffle([...missing, ...rng.shuffle(pool).slice(0, traps)])
  return { answer, fixed, tray, reversed }
}

/** The places whose stone is wrong or missing. `laid[i]` is the colour on place i (fixed stones included). */
export function wrongPlaces(bridge: Bridge, laid: (StoneColour | null)[]): number[] {
  return bridge.answer.flatMap((c, i) => (laid[i] === c ? [] : [i]))
}

/**
 * Every way to fill the gaps from the tray so that the whole bridge is a run of the rainbow, forwards or
 * backwards. A fair bridge has exactly one.
 */
export function solutions(bridge: Bridge): Rainbow[][] {
  const len = bridge.answer.length
  const out: Rainbow[][] = []
  for (const dir of [1, -1])
    for (let first = 0; first < RAINBOW.length; first++) {
      const last = first + dir * (len - 1)
      if (last < 0 || last >= RAINBOW.length) continue
      const row = Array.from({ length: len }, (_, i) => RAINBOW[first + dir * i])
      if (row.some((c, i) => bridge.fixed[i] && c !== bridge.answer[i])) continue
      const left = [...bridge.tray]
      const fits = row.every((c, i) => {
        if (bridge.fixed[i]) return true
        const at = left.indexOf(c)
        if (at < 0) return false
        left.splice(at, 1)
        return true
      })
      if (fits) out.push(row)
    }
  return out
}
