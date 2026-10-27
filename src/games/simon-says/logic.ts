import { clamp, type Rng } from '../../kit/random'

export const animals = ['🐶', '🐱', '🐸', '🐵'] as const
export const animalKeys = ['dog', 'cat', 'frog', 'monkey'] as const

export interface Order {
  animal: number
  simon: boolean
}

export const ORDERS = 16

/** How long the player has to act on an order, in ms. */
export const windowMs = (level: number) => clamp(3000 - level * 180, 1300, 3000)

export function makeOrders(rng: Rng, level: number): Order[] {
  // More "no Simon" tricks at higher levels, but always some of each.
  const trick = clamp(0.25 + level * 0.03, 0.25, 0.45)
  return Array.from({ length: ORDERS }, () => ({ animal: rng.int(0, animals.length - 1), simon: !rng.chance(trick) }))
}

export type Outcome = 'right' | 'wrongAnimal' | 'noSimon' | 'tooSlow' | 'waited'

/** `tapped` is the animal tapped, or null if the time ran out. */
export function judge(order: Order, tapped: number | null): Outcome {
  if (tapped === null) return order.simon ? 'tooSlow' : 'waited'
  if (!order.simon) return 'noSimon'
  return tapped === order.animal ? 'right' : 'wrongAnimal'
}
