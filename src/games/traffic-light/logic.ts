import { clamp, type Rng } from '../../kit/random'

/** Roads to cross in one stage. */
export const STAGE = 4

export type Light = 'red' | 'yellow' | 'green'

export interface Spec {
  /** Hops across the zebra crossing, one per green light. */
  steps: number
  /** How long the light stays green, in ms. */
  green: number
  /** Yellow comes after green (and must not be tapped) from level 3. */
  yellow: number
  /** Red lasts a random time between these, in ms. */
  redMin: number
  redMax: number
}

const SPECS: Spec[] = [
  { steps: 3, green: 2600, yellow: 0, redMin: 1200, redMax: 2200 },
  { steps: 3, green: 2200, yellow: 0, redMin: 1000, redMax: 2400 },
  { steps: 3, green: 2000, yellow: 900, redMin: 1000, redMax: 2400 },
  { steps: 4, green: 1800, yellow: 900, redMin: 900, redMax: 2600 },
  { steps: 4, green: 1600, yellow: 800, redMin: 800, redMax: 2600 },
  { steps: 4, green: 1400, yellow: 800, redMin: 700, redMax: 2800 },
  { steps: 4, green: 1200, yellow: 700, redMin: 600, redMax: 2800 },
  { steps: 5, green: 1100, yellow: 700, redMin: 500, redMax: 3000 },
  { steps: 5, green: 1000, yellow: 600, redMin: 500, redMax: 3000 },
  { steps: 5, green: 900, yellow: 600, redMin: 400, redMax: 3200 },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

/** What a tap does: a tap on green is a hop, any other tap is too early. */
export const tapOn = (light: Light): 'hop' | 'wait' => (light === 'green' ? 'hop' : 'wait')

/** The light after `light`, and how long it stays. A hop ends green early, like a button at a real crossing. */
export function nextLight(rng: Rng, spec: Spec, light: Light): { light: Light; ms: number } {
  if (light === 'red') return { light: 'green', ms: spec.green }
  if (light === 'green' && spec.yellow > 0) return { light: 'yellow', ms: spec.yellow }
  return { light: 'red', ms: rng.int(spec.redMin, spec.redMax) }
}

/** Where the hedgehog sits after `step` hops of `steps`, from 0 (the near kerb) to 1 (the far kerb). */
export const progress = (step: number, steps: number) => clamp(step / steps, 0, 1)
