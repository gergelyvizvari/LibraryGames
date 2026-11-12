import { critterKinds, type CritterKind } from '../../kit/critters'
import type { Rng } from '../../kit/random'

/**
 * Forest Feast: guests sit in one row of chairs behind a long table. The first chair is by the window and the
 * cake stands in front of one chair. Each guest may have one wish, and the table is set when everyone's wish holds.
 */
export type Wish = { kind: 'window' } | { kind: 'cake' } | { kind: 'next'; who: number } | { kind: 'apart'; who: number }

export interface Table {
  /** The animal of each guest; a guest is its index. */
  guests: CritterKind[]
  /** The chair the cake stands in front of (never the window chair). */
  cake: number
  /** One wish or none per guest. */
  wishes: (Wish | null)[]
}

/** Which guest sits on each chair, or null for an empty chair. */
export type Seating = (number | null)[]

/** ok: the wish holds. broken: it cannot hold the way the table is now. open: it depends on who sits down next. */
export type WishState = 'ok' | 'broken' | 'open'

export const guestsFor = (level: number) => (level <= 2 ? 3 : level <= 4 ? 4 : level <= 7 ? 5 : 6)
/** Tables in one stage. */
export const TABLES = 3

const seatOf = (seating: Seating, g: number) => seating.indexOf(g)

export function wishState(table: Table, seating: Seating, g: number): WishState {
  const wish = table.wishes[g]
  const seat = seatOf(seating, g)
  if (!wish) return seat < 0 ? 'open' : 'ok'
  if (seat < 0) return 'open'
  if (wish.kind === 'window') return seat === 0 ? 'ok' : 'broken'
  if (wish.kind === 'cake') return seat === table.cake ? 'ok' : 'broken'
  const other = seatOf(seating, wish.who)
  const free = [seat - 1, seat + 1].some((s) => s >= 0 && s < seating.length && seating[s] === null)
  if (wish.kind === 'next') {
    if (other >= 0) return Math.abs(other - seat) === 1 ? 'ok' : 'broken'
    return free ? 'open' : 'broken'
  }
  if (other >= 0) return Math.abs(other - seat) === 1 ? 'broken' : 'ok'
  return free ? 'open' : 'ok'
}

export const isSet = (table: Table, seating: Seating) =>
  seating.every((g) => g !== null) && table.guests.every((_, g) => wishState(table, seating, g) === 'ok')

function* permutations(n: number): Generator<number[]> {
  const a = [...Array(n).keys()]
  const c = Array(n).fill(0)
  yield [...a]
  let i = 0
  while (i < n) {
    if (c[i] < i) {
      const j = i % 2 ? c[i] : 0
      ;[a[j], a[i]] = [a[i], a[j]]
      yield [...a]
      c[i]++
      i = 0
    } else c[i++] = 0
  }
}

/** How many ways there are to seat everyone so that every wish holds. */
export function countWays(table: Table) {
  let ways = 0
  for (const p of permutations(table.guests.length)) if (isSet(table, p)) ways++
  return ways
}

/** Every wish guest `g` could have that holds when seated as in `answer`. */
function truthsFor(answer: number[], cake: number, g: number, apart: boolean): Wish[] {
  const seat = answer.indexOf(g)
  const out: Wish[] = []
  if (seat === 0) out.push({ kind: 'window' })
  if (seat === cake) out.push({ kind: 'cake' })
  answer.forEach((other, s) => {
    if (other === g) return
    if (Math.abs(s - seat) === 1) out.push({ kind: 'next', who: other })
    else if (apart) out.push({ kind: 'apart', who: other })
  })
  return out
}

/**
 * A new table: wishes are taken from a hidden answer, one guest at a time, until only one seating works.
 * "Not next to" wishes come from level 3 on.
 */
export function makeTable(rng: Rng, level: number): Table {
  const n = guestsFor(level)
  const apart = level >= 3
  let best: Table | null = null
  let bestWays = Infinity
  for (let attempt = 0; attempt < 60; attempt++) {
    const guests = rng.shuffle(critterKinds.filter((k) => k !== 'fox')).slice(0, n)
    const cake = rng.int(1, n - 1)
    const answer = rng.shuffle([...Array(n).keys()])
    const table: Table = { guests, cake, wishes: Array(n).fill(null) }
    let ways = countWays(table)
    for (const g of rng.shuffle([...Array(n).keys()])) {
      if (ways === 1) break
      let pick: Wish | null = null
      let pickWays = ways
      for (const wish of rng.shuffle(truthsFor(answer, cake, g, apart))) {
        table.wishes[g] = wish
        const w = countWays(table)
        if (w < pickWays) {
          pick = wish
          pickWays = w
          // A wish that helps a little is enough; do not always take the strongest one.
          if (rng.chance(0.6)) break
        }
      }
      table.wishes[g] = pick
      ways = pickWays
    }
    if (ways === 1) return table
    if (ways < bestWays) {
      best = { ...table, wishes: [...table.wishes] }
      bestWays = ways
    }
  }
  return best!
}
