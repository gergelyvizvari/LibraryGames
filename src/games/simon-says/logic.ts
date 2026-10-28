import { clamp, type Rng } from '../../kit/random'

export const animals = [
  { emoji: '🐶', key: 'dog' }, { emoji: '🐱', key: 'cat' }, { emoji: '🐸', key: 'frog' }, { emoji: '🐵', key: 'monkey' },
  { emoji: '🐷', key: 'pig' }, { emoji: '🐮', key: 'cow' }, { emoji: '🦁', key: 'lion' }, { emoji: '🐰', key: 'rabbit' },
  { emoji: '🐧', key: 'penguin' }, { emoji: '🐘', key: 'elephant' }, { emoji: '🦊', key: 'fox' }, { emoji: '🐔', key: 'chicken' },
] as const

/** Four animals for the youngest players, six from level 4. A different set every round. */
export function pickAnimals(rng: Rng, level: number) {
  return rng.shuffle(animals).slice(0, level >= 4 ? 6 : 4)
}

export interface Order {
  animal: number
  simon: boolean
}

export const ORDERS = 16

/** How long the player has to act on an order, in ms. */
export const windowMs = (level: number) => clamp(3000 - level * 180, 1300, 3000)

export function makeOrders(rng: Rng, level: number, count: number): Order[] {
  // More "no Simon" tricks at higher levels, but always some of each.
  const trick = clamp(0.25 + level * 0.03, 0.25, 0.45)
  const orders: Order[] = []
  for (let i = 0; i < ORDERS; i++) {
    let animal = rng.int(0, count - 1)
    // Never the same animal twice in a row, so every order needs a fresh look.
    while (i > 0 && animal === orders[i - 1].animal) animal = rng.int(0, count - 1)
    orders.push({ animal, simon: !rng.chance(trick) })
  }
  return orders
}

export type Outcome = 'right' | 'wrongAnimal' | 'noSimon' | 'tooSlow' | 'waited'

/** `tapped` is the animal tapped, or null if the time ran out. */
export function judge(order: Order, tapped: number | null): Outcome {
  if (tapped === null) return order.simon ? 'tooSlow' : 'waited'
  if (!order.simon) return 'noSimon'
  return tapped === order.animal ? 'right' : 'wrongAnimal'
}
