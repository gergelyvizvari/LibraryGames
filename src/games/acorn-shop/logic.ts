import { clamp, type Rng } from '../../kit/random'
import type { ThingId } from '../../kit/things'

/** Snacks to buy in one stage. */
export const STAGE = 5

/** Acorn coins and what they are worth. */
export const COINS = [1, 2, 5] as const
export type Coin = (typeof COINS)[number]

export interface Spec {
  min: number
  max: number
  /** The coins the purse holds. */
  coins: Coin[]
  /** From level 7 the purse holds only a few coins, so the child has to pick the right ones; before that it never runs out. */
  extra: number | null
}

const SPECS: Spec[] = [
  { min: 2, max: 4, coins: [1], extra: null },
  { min: 3, max: 6, coins: [1, 2], extra: null },
  { min: 4, max: 8, coins: [1, 2], extra: null },
  { min: 5, max: 10, coins: [1, 2, 5], extra: null },
  { min: 7, max: 14, coins: [1, 2, 5], extra: null },
  { min: 9, max: 20, coins: [1, 2, 5], extra: null },
  { min: 6, max: 12, coins: [1, 2, 5], extra: 2 },
  { min: 8, max: 16, coins: [1, 2, 5], extra: 3 },
  { min: 10, max: 20, coins: [1, 2, 5], extra: 3 },
  { min: 12, max: 22, coins: [1, 2, 5], extra: 3 },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

export const SNACKS: ThingId[] = ['apple', 'cookie', 'berries', 'mushroom', 'fish', 'flower']

export const sum = (coins: number[]) => coins.reduce((a, b) => a + b, 0)

export interface Task {
  snack: ThingId
  price: number
  /** The coins to pay with when they can run out, biggest first; null when every kind of coin never runs out. */
  purse: Coin[] | null
}

/** Coins that add up to exactly `price`, picked at random. */
function payWith(rng: Rng, price: number, coins: Coin[]): Coin[] {
  const out: Coin[] = []
  let left = price
  while (left > 0) {
    const fits = coins.filter((c) => c <= left)
    // Mostly the biggest coin that fits, so the purse stays small enough to see at a glance.
    const c = rng.chance(0.6) ? fits[fits.length - 1] : rng.pick(fits)
    out.push(c)
    left -= c
  }
  return out
}

/** Whether some of `purse` adds up to exactly `price`. */
export function canPay(purse: number[], price: number) {
  let reach = new Set([0])
  for (const c of purse) reach = new Set([...reach, ...[...reach].map((r) => r + c)])
  return reach.has(price)
}

export function makeTask(rng: Rng, level: number, last?: Task): Task {
  const spec = specFor(level)
  let price = rng.int(spec.min, spec.max)
  if (last && price === last.price) price = price === spec.max ? spec.min : price + 1
  const snack = rng.pick(SNACKS.filter((s) => s !== last?.snack))
  if (spec.extra === null) return { snack, price, purse: null }
  const purse = [...payWith(rng, price, spec.coins), ...Array.from({ length: spec.extra }, () => rng.pick(spec.coins))]
  return { snack, price, purse: purse.sort((a, b) => b - a) }
}

/** What adding `coin` to `paid` does: still short, exactly right, or too much. */
export function pay(paid: number[], coin: number, price: number): 'short' | 'exact' | 'over' {
  const total = sum(paid) + coin
  return total < price ? 'short' : total === price ? 'exact' : 'over'
}
